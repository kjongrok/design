from werkzeug.security import generate_password_hash, check_password_hash
from repositories.user_repository import UserRepository
from utils.jwt_utils import encode_jwt

class AuthService:
    def __init__(self, user_repository=None):
        self.repository = user_repository or UserRepository()

    def signup(self, email, password, name, company_name=None, business_registration_no=None):
        # 1. Check if email exists
        existing_user = self.repository.find_by_email(email)
        if existing_user:
            return {"success": False, "message": "이미 사용 중인 이메일입니다."}, 400

        # 2. Hash password
        password_hash = generate_password_hash(password)

        # 3. Create user
        try:
            user_id = self.repository.create_user_with_company(
                email=email,
                password_hash=password_hash,
                name=name,
                company_name=company_name,
                business_registration_no=business_registration_no
            )
            return {"success": True, "user_id": user_id, "message": "회원가입이 완료되었습니다."}, 201
        except Exception as e:
            print(f"Signup error: {e}")
            return {"success": False, "message": "회원가입 처리 중 서버 오류가 발생했습니다."}, 500

    def login(self, email, password):
        user = self.repository.find_by_email(email)
        if not user:
            return {"success": False, "message": "사용자를 찾을 수 없습니다."}, 401

        if not user.get('password_hash') or not check_password_hash(user['password_hash'], password):
            return {"success": False, "message": "이메일 또는 비밀번호가 올바르지 않습니다."}, 401

        if user.get('status') == 'blocked':
            return {"success": False, "message": "정지된 계정입니다. 관리자에게 문의하세요."}, 403

        # Update last login
        self.repository.update_last_login(user['id'])

        # Generate token
        token = encode_jwt(user['id'], user['email'], user['role'])

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "role": user['role'],
                "company_name": user.get('company_name')
            }
        }, 200

    def get_me(self, user_id):
        user = self.repository.find_by_id(user_id)
        if not user:
            return {"success": False, "message": "사용자를 찾을 수 없습니다."}, 404
        return {"success": True, "user": user}, 200

    def update_user(self, user_id, name):
        try:
            self.repository.update_user_info(user_id, name)
            return {"success": True, "message": "개인 정보가 성공적으로 업데이트되었습니다."}, 200
        except Exception as e:
            print(f"Update user error: {e}")
            return {"success": False, "message": "개인 정보 업데이트에 실패했습니다."}, 500

    def update_email(self, user_id, new_email):
        # 중복 이메일 체크
        existing_user = self.repository.find_by_email(new_email)
        if existing_user and existing_user['id'] != user_id:
            return {"success": False, "message": "이미 사용 중이거나 가입된 이메일입니다."}, 400

        try:
            self.repository.update_email(user_id, new_email)
            user = self.repository.find_by_id(user_id)
            # 이메일이 변경되었으므로 토큰 재발급
            new_token = encode_jwt(user['id'], user['email'], user['role'])
            return {
                "success": True, 
                "message": "이메일이 성공적으로 업데이트되었습니다.",
                "token": new_token,
                "email": user['email']
            }, 200
        except Exception as e:
            print(f"Update email error: {e}")
            return {"success": False, "message": "이메일 업데이트에 실패했습니다."}, 500

    def update_company(self, user_id, data):
        try:
            self.repository.update_company_info(
                user_id, 
                data.get('company_name'), 
                data.get('business_registration_no'), 
                data.get('business_type'),
                data.get('is_youth_company', 0),
                data.get('is_woman_company', 0),
                data.get('is_disabled_company', 0),
                data.get('licenses', [])
            )
            return {"success": True, "message": "기업 정보가 성공적으로 업데이트되었습니다."}, 200
        except Exception as e:
            print(f"Update company error: {e}")
            return {"success": False, "message": "기업 정보 업데이트에 실패했습니다."}, 500

    def update_password(self, user_id, old_password, new_password):
        # 1. Fetch user to verify old password
        user = self.repository.find_by_id(user_id)
        if not user:
            return {"success": False, "message": "사용자를 찾을 수 없습니다."}, 404

        # Because find_by_id doesn't return password_hash, we need find_by_email to get hash
        user_full = self.repository.find_by_email(user['email'])
        if not check_password_hash(user_full['password_hash'], old_password):
            return {"success": False, "message": "기존 비밀번호가 일치하지 않습니다."}, 400

        # 2. Hash and update new password
        new_hash = generate_password_hash(new_password)
        try:
            self.repository.update_password(user_id, new_hash)
            return {"success": True, "message": "비밀번호가 성공적으로 변경되었습니다."}, 200
        except Exception as e:
            print(f"Update password error: {e}")
            return {"success": False, "message": "비밀번호 변경에 실패했습니다."}, 500

    def reset_password_request(self, email):
        import string
        import random
        from services.email_service import email_service
        
        user = self.repository.find_by_email(email)
        if not user:
            # 보안을 위해 존재하지 않는 이메일이라도 구체적인 에러 대신 성공 메시지와 동일한 모호한 응답을 주는 것이 권장되지만, 
            # 사용자 경험을 위해 가입되지 않은 이메일임을 안내
            return {"success": False, "message": "가입되지 않은 이메일입니다."}, 404

        # 소셜 로그인 가입자인 경우 비밀번호 재설정 불가 안내
        if user.get('auth_provider') and user.get('auth_provider') != 'local':
            return {"success": False, "message": "소셜 로그인(구글/카카오)으로 가입된 계정은 비밀번호 재설정을 지원하지 않습니다."}, 400

        # 임시 비밀번호 생성 (8자리 랜덤 영문/숫자)
        characters = string.ascii_letters + string.digits
        temp_password = ''.join(random.choice(characters) for i in range(8))
        
        # 비밀번호 해싱 및 DB 업데이트
        new_hash = generate_password_hash(temp_password)
        try:
            self.repository.update_password(user['id'], new_hash)
            
            # 이메일 발송
            sent = email_service.send_temp_password(email, user['name'], temp_password)
            if sent:
                return {"success": True, "message": "임시 비밀번호가 이메일로 발송되었습니다."}, 200
            else:
                # 이메일 발송 실패 시 (개발 환경 등)
                return {"success": False, "message": "이메일 발송에 실패했습니다. 관리자에게 문의하세요."}, 500
        except Exception as e:
            print(f"Reset password error: {e}")
            return {"success": False, "message": "비밀번호 재설정 처리 중 오류가 발생했습니다."}, 500

    def verify_business_number(self, user_id, biz_no):
        if not biz_no:
            return {"success": False, "message": "사업자등록번호가 필요합니다."}, 400
        clean_no = biz_no.replace("-", "").strip()
        if len(clean_no) == 10 and clean_no.isdigit():
            try:
                self.repository.update_company_verification(user_id, 1)
                return {"success": True, "message": "정상적인 사업자입니다."}, 200
            except Exception as e:
                print(f"Verify error: {e}")
                return {"success": False, "message": "검증 상태 업데이트에 실패했습니다."}, 500
        return {"success": False, "message": "유효하지 않은 사업자등록번호입니다."}, 400

    def upload_verification_doc(self, user_id):
        try:
            self.repository.update_verification_status(user_id, 'PENDING')
            return {"success": True, "message": "서류가 성공적으로 제출되었습니다. 심사 대기중입니다."}, 200
        except Exception as e:
            print(f"Upload doc error: {e}")
            return {"success": False, "message": "서류 제출 상태 업데이트에 실패했습니다."}, 500
