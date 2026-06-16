from flask import Blueprint, request, jsonify, redirect
from services.auth_service import AuthService
from services.oauth_service import oauth_service
from utils.auth_decorator import require_auth
from core.database import get_connection
from utils.jwt_utils import encode_jwt
from repositories.user_repository import UserRepository
import datetime

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()
user_repo = UserRepository()

@auth_bp.post('/signup')
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "잘못된 요청 데이터입니다."}), 400

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    company_name = data.get('company_name')
    business_registration_no = data.get('business_registration_no')

    if not email or not password or not name:
        return jsonify({"success": False, "message": "이메일, 비밀번호, 이름은 필수 항목입니다."}), 400

    result, status_code = auth_service.signup(email, password, name, company_name, business_registration_no)
    return jsonify(result), status_code

@auth_bp.post('/login')
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "잘못된 요청 데이터입니다."}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "이메일과 비밀번호는 필수 항목입니다."}), 400

    result, status_code = auth_service.login(email, password)
    return jsonify(result), status_code

@auth_bp.post('/reset-password-request')
def reset_password_request():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "잘못된 요청 데이터입니다."}), 400

    email = data.get('email')
    if not email:
        return jsonify({"success": False, "message": "이메일은 필수 항목입니다."}), 400

    result, status_code = auth_service.reset_password_request(email)
    return jsonify(result), status_code

@auth_bp.get('/me')
@require_auth
def get_me():
    user_id = request.user['sub']
    result, status_code = auth_service.get_me(user_id)
    return jsonify(result), status_code

@auth_bp.put('/me')
@require_auth
def update_me():
    user_id = request.user['sub']
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"success": False, "message": "이름은 필수 항목입니다."}), 400
    
    result, status_code = auth_service.update_user(user_id, name)
    return jsonify(result), status_code

@auth_bp.put('/me/email')
@require_auth
def update_email():
    user_id = request.user['sub']
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"success": False, "message": "이메일은 필수 항목입니다."}), 400
    
    result, status_code = auth_service.update_email(user_id, email)
    return jsonify(result), status_code

@auth_bp.put('/me/company')
@require_auth
def update_company():
    user_id = request.user['sub']
    data = request.get_json()
    result, status_code = auth_service.update_company(user_id, data)
    return jsonify(result), status_code

@auth_bp.put('/me/password')
@require_auth
def update_password():
    user_id = request.user['sub']
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"success": False, "message": "기존 비밀번호와 새 비밀번호를 모두 입력해야 합니다."}), 400

    result, status_code = auth_service.update_password(user_id, old_password, new_password)
    return jsonify(result), status_code

@auth_bp.post('/verify-business')
@require_auth
def verify_business():
    user_id = request.user['sub']
    data = request.get_json()
    biz_no = data.get('business_registration_no')
    result, status_code = auth_service.verify_business_number(user_id, biz_no)
    return jsonify(result), status_code

@auth_bp.post('/upload-verification-doc')
@require_auth
def upload_verification_doc():
    user_id = request.user['sub']
    result, status_code = auth_service.upload_verification_doc(user_id)
    return jsonify(result), status_code

# --- OAuth Routes ---

@auth_bp.get('/oauth/<provider>/login')
def oauth_login(provider):
    if provider == 'google':
        url, err = oauth_service.get_google_login_url()
    elif provider == 'kakao':
        url, err = oauth_service.get_kakao_login_url()
    else:
        return jsonify({"success": False, "message": "지원하지 않는 제공자입니다."}), 400
        
    if err:
        return jsonify({"success": False, "message": err}), 400
        
    return jsonify({"success": True, "url": url}), 200

@auth_bp.post('/oauth/<provider>/callback')
def oauth_callback(provider):
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({"success": False, "message": "인가 코드가 없습니다."}), 400
        
    if provider == 'google':
        profile, err = oauth_service.process_google_callback(code)
    elif provider == 'kakao':
        profile, err = oauth_service.process_kakao_callback(code)
    else:
        return jsonify({"success": False, "message": "지원하지 않는 제공자입니다."}), 400
        
    if err:
        return jsonify({"success": False, "message": err}), 400
        
    # DB에서 유저 조회 및 생성 로직
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. oauth_id로 기존 소셜 가입자 찾기
            cursor.execute("SELECT * FROM users WHERE auth_provider=%s AND oauth_id=%s", (profile['provider'], profile['oauth_id']))
            user = cursor.fetchone()
            
            if not user:
                # 2. 이메일로 기존 일반 가입자 찾아서 연동
                cursor.execute("SELECT * FROM users WHERE email=%s", (profile['email'],))
                user = cursor.fetchone()
                
                if user:
                    # 기존 회원 정보에 oauth 연결
                    cursor.execute("UPDATE users SET auth_provider=%s, oauth_id=%s WHERE id=%s", 
                                  (profile['provider'], profile['oauth_id'], user['id']))
                else:
                    # 3. 아예 신규 회원 가입
                    cursor.execute("""
                        INSERT INTO users (email, name, role, auth_provider, oauth_id) 
                        VALUES (%s, %s, %s, %s, %s)
                    """, (profile['email'], profile['name'], 'USER', profile['provider'], profile['oauth_id']))
                    user_id = cursor.lastrowid
                    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
                    user = cursor.fetchone()
            
            conn.commit()

            if user.get('status') == 'blocked':
                return jsonify({"success": False, "message": "정지된 계정입니다. 관리자에게 문의하세요."}), 403
            
            # 4. JWT 토큰 발급
            token = encode_jwt(user['id'], user['email'], user['role'])
            
            return jsonify({
                "success": True,
                "token": token,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "name": user['name'],
                    "role": user['role']
                }
            }), 200
            
    except Exception as e:
        conn.rollback()
        print("OAuth DB Error:", e)
        return jsonify({"success": False, "message": "로그인 처리 중 오류가 발생했습니다."}), 500
    finally:
        conn.close()

@auth_bp.delete('/me')
@require_auth
def delete_account():
    user_id = request.user['sub']
    try:
        user_repo.delete_user(user_id)
        return jsonify({"success": True, "message": "계정이 삭제되었습니다."}), 200
    except Exception as e:
        print("Delete Account Error:", e)
        return jsonify({"success": False, "message": "탈퇴 처리에 실패했습니다."}), 500

