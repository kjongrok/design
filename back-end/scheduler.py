import os
from apscheduler.schedulers.background import BackgroundScheduler
from services.g2b_scraper_service import g2b_scraper
import atexit

def daily_email_job():
    from services.match_service import get_matched_notices_for_user
    from services.email_service import email_service
    from core.database import get_connection
    
    print("[Scheduler] Starting daily email job...")
    
    try:
        users = []
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT u.id, u.email, u.name 
                    FROM users u 
                    JOIN user_match_rules r ON u.id = r.user_id 
                    WHERE r.notification_enabled = TRUE AND r.is_active = TRUE
                """)
                users = cursor.fetchall()
                
        for user in users:
            matches = get_matched_notices_for_user(user['id'])
            # 하루 전부터 오늘까지 매칭된 새 공고만 필터링하는 로직이 필요하지만, 여기서는 최신 매칭결과 5개를 보낸다고 가정합니다.
            if matches:
                email_service.send_daily_matches(user['email'], user['name'], matches)
    except Exception as e:
        print("[Scheduler] Daily email job error:", e)

def start_scheduler():
    scheduler = BackgroundScheduler(daemon=True, timezone="Asia/Seoul")
    
    # 환경변수에서 간격 가져오기 (기본값: 1시간 = 3600초)
    interval = int(os.environ.get("G2B_COLLECT_INTERVAL_SECONDS", 3600))
    lookback = int(os.environ.get("G2B_LOOKBACK_HOURS", 2))
    
    # 정기 실행 잡 등록
    scheduler.add_job(func=lambda: g2b_scraper.fetch_and_store_notices(hours_back=lookback), trigger="interval", seconds=interval)
    
    # 매일 아침 09:00 이메일 발송 잡 등록 (한국 시간 기준)
    scheduler.add_job(func=daily_email_job, trigger="cron", hour=9, minute=0)
    
    scheduler.start()
    
    # 서버 종료 시 스케줄러 종료
    atexit.register(lambda: scheduler.shutdown())
    
    print(f"[Scheduler] Started. Will fetch G2B data every {interval} seconds.")
    
    # 서버 구동 시 최초 1회 실행 설정 (환경변수 확인)
    if os.environ.get("G2B_COLLECT_RUN_ON_START", "true").lower() == "true":
        print("[Scheduler] Running initial data fetch...")
        scheduler.add_job(func=lambda: g2b_scraper.fetch_and_store_notices(hours_back=lookback))
