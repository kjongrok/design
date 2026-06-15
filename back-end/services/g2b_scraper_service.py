import os
import requests
import pymysql
from datetime import datetime, timedelta
from dotenv import load_dotenv
from core.database import get_connection
from services.match_service import run_global_matching

load_dotenv()

class G2BScraperService:
    def __init__(self):
        self.api_key = os.environ.get("G2B_API_KEY")
        self.base_url = os.environ.get("G2B_API_BASE_URL", "http://apis.data.go.kr/1230000/ad/BidPublicInfoService")
        self.endpoints = os.environ.get("G2B_COLLECT_ENDPOINTS", "getBidPblancListInfoServc").split(',')

    def fetch_and_store_notices(self, hours_back=2):
        print(f"[Scraper] Starting data fetch for the last {hours_back} hours...")
        
        now = datetime.now()
        start_time = now - timedelta(hours=hours_back)
        
        # OpenAPI requires format YYYYMMDDHHMM
        inqryBgnDt = start_time.strftime("%Y%m%d%H%M")
        inqryEndDt = now.strftime("%Y%m%d%H%M")

        conn = get_connection()
        log_id = None
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO collection_run_logs (job_name, status, query_from, query_to)
                    VALUES (%s, %s, %s, %s)
                """, ("G2B_AUTO_SYNC", "RUNNING", start_time, now))
                log_id = cursor.lastrowid
            conn.commit()
        except Exception as e:
            print("[Scraper] Failed to create run log:", e)
        finally:
            conn.close()

        inserted_count = 0
        error_count = 0
        error_message = None

        for endpoint in self.endpoints:
            url = f"{self.base_url}/{endpoint}"
            params = {
                'serviceKey': self.api_key,
                'inqryDiv': '1', # 1: 등록일시 기준
                'inqryBgnDt': inqryBgnDt,
                'inqryEndDt': inqryEndDt,
                'numOfRows': os.environ.get('G2B_NUM_OF_ROWS', 100),
                'pageNo': 1,
                'type': 'json'
            }

            biz_type = "UNKNOWN"
            if "Servc" in endpoint:
                biz_type = "SERVC"
            elif "Thng" in endpoint:
                biz_type = "THNG"
            elif "Cnst" in endpoint:
                biz_type = "CNST"

            try:
                print(f"[Scraper] Fetching {url} ...")
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Handle API error structures
                    if "response" in data and "body" in data["response"]:
                        items = data["response"]["body"].get("items", [])
                        if items:
                            inserted_count += self._save_items_to_db(items, biz_type)
                    elif "nkoneps.com.response.ResponseError" in data:
                        err_msg = data['nkoneps.com.response.ResponseError']['header']['resultMsg']
                        print(f"[Scraper] API Error: {err_msg}")
                        error_count += 1
                        error_message = err_msg
            except Exception as e:
                print(f"[Scraper] Error fetching from {url}: {e}")
                error_count += 1
                error_message = str(e)

        print(f"[Scraper] Finished fetch. Inserted {inserted_count} new notices.")

        if inserted_count > 0:
            print("[Scraper] Running global match engine for new notices...")
            run_global_matching()
            print("[Scraper] Match engine finished.")
        
        # Update run log
        if log_id:
            conn = get_connection()
            try:
                with conn.cursor() as cursor:
                    final_status = "ERROR" if error_count > 0 else "SUCCESS"
                    cursor.execute("""
                        UPDATE collection_run_logs 
                        SET status = %s, ended_at = NOW(), saved_count = %s, error_count = %s, error_message = %s
                        WHERE id = %s
                    """, (final_status, inserted_count, error_count, error_message, log_id))
                conn.commit()
            except Exception as e:
                print("[Scraper] Failed to update run log:", e)
            finally:
                conn.close()

        return inserted_count

    def _save_items_to_db(self, items, biz_type="UNKNOWN"):
        conn = get_connection()
        inserted_count = 0
        try:
            with conn.cursor() as cursor:
                for item in items:
                    # G2B API parsing (keys might vary slightly between endpoints, so we use .get)
                    notice_id = item.get('bidNtceNo', '')
                    title = item.get('bidNtceNm', '')
                    notice_org_name = item.get('ntceInsttNm', '')
                    demand_org_name = item.get('dminstNm', '')
                    
                    # Parse dates if present
                    reg_date_str = item.get('bidNtceDt') # "2024-05-28 10:00:00"
                    deadline_str = item.get('bidClseDt') or item.get('bidEndDt')
                    
                    estimated_price = item.get('presmptPrce') or item.get('bidLmtAmt') or 0
                    
                    region = item.get('ntceInsttOfcNm', '전국')
                    url = item.get('bidNtceDtlUrl', '')

                    if not notice_id or not title:
                        continue
                        
                    # Insert ignore to prevent duplicates
                    sql = """
                        INSERT IGNORE INTO bid_notices 
                        (notice_no, title, notice_org_name, demand_org_name, estimated_price, region, detail_url, deadline_at, biz_type)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    try:
                        affected = cursor.execute(sql, (
                            notice_id, 
                            title, 
                            notice_org_name, 
                            demand_org_name, 
                            estimated_price, 
                            region, 
                            url, 
                            deadline_str if deadline_str else None,
                            biz_type
                        ))
                        if affected > 0:
                            inserted_count += 1
                    except Exception as e:
                        print(f"[Scraper] Insert error for {notice_id}: {e}")
                conn.commit()
        except Exception as e:
            print("[Scraper] DB Save error:", e)
        finally:
            conn.close()
        
        return inserted_count

# 싱글톤 인스턴스 내보내기
g2b_scraper = G2BScraperService()
