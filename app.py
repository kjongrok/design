import sys
import os

# 백엔드 폴더를 파이썬 경로에 추가하여 모듈을 찾을 수 있게 합니다.
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'back-end')
sys.path.insert(0, backend_dir)

# 환경 변수가 백엔드 폴더를 기준으로 읽힐 수 있도록 현재 디렉토리를 변경합니다.
os.chdir(backend_dir)

# 백엔드의 app.py에서 Flask 앱 인스턴스를 가져옵니다.
from app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
