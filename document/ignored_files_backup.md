# 🔐 배포 제외 파일 백업 내역 (발표용)

본 문서는 프로젝트의 `.gitignore` 설정으로 인해 GitHub 저장소에 올라가지 않은 보안 민감성 파일(`.env` 등)의 내용을 백업하기 위해 작성되었습니다.
발표 및 기록용이므로 실제 환경 변수 값들을 그대로 보존합니다.

## 1. `back-end/.env`

백엔드 서버 구동 시 필요한 데이터베이스 연결 정보, 공공데이터 API 키, 이메일 SMTP 정보, 소셜 로그인 OAuth 키 등이 포함된 환경변수 파일입니다.

```env
FLASK_ENV=development
SECRET_KEY=change-me

DB_HOST=localhost
DB_NAME=bidmatch
DB_USER=root
DB_PASSWORD=1234
DB_PORT=3306
DB_AUTO_SYNC_SCHEMA=true

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

G2B_API_KEY=227effebe052880fee13ebdf094752f835fedb9fed1f2a4e3b76972a81f4dce3
G2B_API_BASE_URL=http://apis.data.go.kr/1230000/ad/BidPublicInfoService
G2B_COLLECT_ENDPOINTS=getBidPblancListInfoServc,getBidPblancListInfoThng
G2B_INQRY_DIV=1
G2B_LOOKBACK_HOURS=2
G2B_NUM_OF_ROWS=100
G2B_COLLECT_INTERVAL_SECONDS=3600
G2B_COLLECT_RUN_ON_START=true
G2B_EMBEDDED_WORKER_ENABLED=false
G2B_REQUEST_DELAY_SECONDS=1.0
G2B_MAX_RETRIES=3

# ==========================================
# 📧 1. 이메일 자동 발송 (SMTP) 설정 안내
# ==========================================
# Gmail을 사용하실 경우:
# 1. 구글 계정 관리 > 보안 > '2단계 인증' 활성화
# 2. 보안 > '앱 비밀번호' 생성 (앱 이름: BidMatch 등 자유롭게)
# 3. 생성된 16자리 비밀번호를 띄어쓰기 없이 아래 SMTP_PASSWORD에 입력하세요.
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xhxhahs2@gmail.com
SMTP_PASSWORD=jdik snzz ybjt ipcn

# ==========================================
# 🤖 2. AI 공고 요약 (Google Gemini) 설정 안내
# ==========================================
# 1. https://aistudio.google.com/app/apikey 에 접속하여 API 키 발급
# 2. 발급받은 키를 아래에 입력하세요.
GEMINI_API_KEY=AQ.Ab8RN6IMC9378-cGbq********************
G2B_RETRY_BASE_DELAY_SECONDS=5.0
G2B_BACKFILL_AFTER_COLLECT=true
G2B_LICENSE_BACKFILL_LIMIT=20


# OAuth (Social Login)
GOOGLE_CLIENT_ID=770183613304-9bj0gcihhkhrh1o0********************.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xf3hzCXoFhhmy********************
KAKAO_CLIENT_ID=7ac98df2d56430aabd1898d3449fe487
KAKAO_CLIENT_SECRET=0J4lDgKz8ipB3H1YSkeps2Xwx99ApkhF
KAKAO_REDIRECT_URI=http://localhost:5173/oauth/callback/kakao
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback/google
```

> **참고:** `.gitignore`에 등록된 `__pycache__`, `node_modules`, `venv`, `build/dist` 등은 빌드 시 자동 생성되거나 패키지 매니저를 통해 복원할 수 있는 파일들이므로 백업 대상에서 제외하였습니다. 오직 유실 시 복구가 불가능한 시스템 환경 변수 세팅값만 기록하였습니다.
