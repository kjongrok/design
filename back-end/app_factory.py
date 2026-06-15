from flask import Flask
from flask_cors import CORS

from config import Config
from api import register_blueprints
from core.schema_manager import sync_database_schema


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 앱 구동 시 스케줄러 시작

    # 헬스 체크 엔드포인트
    @app.route('/health')
    def health_check():
        return {"status": "ok"}, 200

    origins = [origin.strip() for origin in app.config["CORS_ORIGINS"].split(",") if origin.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}})

    if app.config["DB_AUTO_SYNC_SCHEMA"]:
        from create_db import create_db
        create_db()
        sync_database_schema()

    # 데이터베이스가 생성된 후 스케줄러 시작
    from scheduler import start_scheduler
    start_scheduler()

    register_blueprints(app)
    return app
