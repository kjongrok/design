import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from repositories.email_history_repository import EmailHistoryRepository

class EmailService:
    def __init__(self, repository=None):
        self.repository = repository or EmailHistoryRepository()
        self.server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
        self.port = int(os.environ.get("SMTP_PORT", 587))
        self.user = os.environ.get("SMTP_USER")
        self.password = os.environ.get("SMTP_PASSWORD")
        self.frontend_url = os.environ.get("FRONTEND_URL", "https://web-bidmatch-frontend-mqf5nycdd44e8d2c.sel3.cloudtype.app")

    def list_histories(self, user_id=None):
        return self.repository.list(user_id)

    def send_daily_matches(self, to_email, user_name, matched_notices):
        if not self.user or not self.password:
            print("[EmailService] SMTP 설정이 없어 이메일을 발송할 수 없습니다.")
            return False

        if not matched_notices:
            return True

        today_str = datetime.now().strftime("%Y년 %m월 %d일")
        
        # HTML 템플릿 구성
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Malgun Gothic', sans-serif; background-color: #f8fafc; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }}
                .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }}
                .title {{ font-size: 20px; font-weight: bold; color: #0f172a; }}
                .notice-item {{ border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }}
                .notice-title {{ font-weight: bold; color: #1d4ed8; font-size: 16px; margin-bottom: 8px; }}
                .badge {{ background-color: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
                .footer {{ margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="title">🔔 BidMatch 맞춤 공고 알림</div>
                    <div style="color: #64748b; margin-top: 5px;">{today_str}</div>
                </div>
                <p>안녕하세요, <strong>{user_name}</strong>님!</p>
                <p>오늘 새롭게 수집된 공고 중 대표님의 관심 조건과 일치하는 공고가 <strong>{len(matched_notices)}건</strong> 있습니다.</p>
                
                <div style="margin-top: 24px;">
        """

        for notice in matched_notices[:5]: # 최대 5개만 메일에 표시
            budget = f"₩ {int(notice['estimated_price']):,}" if notice.get('estimated_price') else "미정"
            html_content += f"""
                <div class="notice-item">
                    <div class="notice-title">{notice['title']}</div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.6;">
                        • <strong>기관명:</strong> {notice.get('demand_org_name', notice.get('notice_org_name', '알 수 없음'))}<br/>
                        • <strong>추정가격:</strong> {budget}<br/>
                        • <strong>마감일시:</strong> <span style="color: #ef4444; font-weight: bold;">{notice.get('deadline_at', '미정')}</span>
                    </div>
                </div>
            """

        if len(matched_notices) > 5:
            html_content += f"""
                <div style="text-align: center; padding: 10px; color: #64748b; font-size: 14px;">
                    ...외 {len(matched_notices) - 5}건의 공고가 더 있습니다.
                </div>
            """

        html_content += f"""
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{self.frontend_url}/dashboard" style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">대시보드에서 전체 확인하기</a>
                </div>
                <div class="footer">
                    본 메일은 발신전용 메일입니다. <br/>
                    © 2025 BidMatch. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[BidMatch] {today_str} {user_name}님을 위한 맞춤 공고 알림"
        msg['From'] = f"BidMatch <{self.user}>"
        msg['To'] = to_email

        msg.attach(MIMEText(html_content, 'html'))

        try:
            with smtplib.SMTP(self.server, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
            print(f"[EmailService] {to_email} 로 알림 발송 성공!")
            return True
        except Exception as e:
            print(f"[EmailService] 이메일 발송 실패: {e}")
            return False

    def send_temp_password(self, to_email, user_name, temp_password):
        if not self.user or not self.password:
            print("[EmailService] SMTP 설정이 없어 이메일을 발송할 수 없습니다.")
            return False

        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Malgun Gothic', sans-serif; background-color: #f8fafc; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }}
                .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }}
                .title {{ font-size: 20px; font-weight: bold; color: #0f172a; }}
                .pw-box {{ background-color: #f1f5f9; border: 1px dashed #cbd5e1; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0f172a; margin: 30px 0; border-radius: 8px; }}
                .footer {{ margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="title">🔒 BidMatch 비밀번호 재설정 안내</div>
                </div>
                <p>안녕하세요, <strong>{user_name}</strong>님!</p>
                <p>요청하신 비밀번호 재설정에 따라 아래와 같이 임시 비밀번호가 발급되었습니다.</p>
                <p>로그인 후 반드시 비밀번호를 변경해 주시기 바랍니다.</p>
                
                <div class="pw-box">{temp_password}</div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{self.frontend_url}/login" style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">로그인하러 가기</a>
                </div>
                <div class="footer">
                    본 메일은 발신전용 메일입니다. <br/>
                    © 2026 BidMatch. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['Subject'] = "[BidMatch] 임시 비밀번호 발급 안내"
        msg['From'] = f"BidMatch <{self.user}>"
        msg['To'] = to_email

        msg.attach(MIMEText(html_content, 'html'))

        try:
            with smtplib.SMTP(self.server, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
            print(f"[EmailService] {to_email} 로 임시 비밀번호 발송 성공!")
            return True
        except Exception as e:
            print(f"[EmailService] 임시 비밀번호 발송 실패: {e}")
            return False

email_service = EmailService()
