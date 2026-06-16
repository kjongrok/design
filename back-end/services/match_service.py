import pymysql
import json
from datetime import datetime
from core.database import get_connection
from repositories.match_rule_repository import MatchRuleRepository

def run_match_for_rule(rule_id):
    """
    특정 조건(rule)을 기반으로 현재 진행 중인 공고들을 검색하여
    매칭 결과를 match_results 테이블에 저장합니다.
    """
    repo = MatchRuleRepository()
    rule = repo.get_by_id(rule_id)
    if not rule:
        return 0
    
    # 키워드 파싱 (콤마 분리 문자열 또는 JSON 가정)
    inc_kw = rule.get('include_keywords')
    exc_kw = rule.get('exclude_keywords')
    
    include_keywords = [k.strip() for k in inc_kw.split(',')] if inc_kw else []
    exclude_keywords = [k.strip() for k in exc_kw.split(',')] if exc_kw else []
    
    region_filter = rule.get('region')
    biz_type_filter = rule.get('biz_types')

    if not include_keywords:
        return 0 # 키워드가 없으면 매칭 불가능으로 간주

    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            # 1. 진행 중인 공고 가져오기 (성능을 위해 최근 1000개 정도만 가져오거나 deadline 기준)
            sql = "SELECT id, title, notice_org_name, demand_org_name, region, biz_type FROM bid_notices WHERE status = 'OPEN' ORDER BY id DESC LIMIT 500"
            cursor.execute(sql)
            notices = cursor.fetchall()
            
            matched_count = 0
            
            for notice in notices:
                text_to_search = f"{notice['title']} {notice['notice_org_name']} {notice['demand_org_name']}"
                
                # 1. 제외 키워드 체크
                is_excluded = False
                for ek in exclude_keywords:
                    if ek and ek in text_to_search:
                        is_excluded = True
                        break
                if is_excluded:
                    continue
                    
                # 2. 지역 및 업종 필터 체크 (단순화: 필터가 있고, 공고에 정보가 있는데 불일치하는 경우 스킵)
                if region_filter and region_filter != '전국':
                    if notice['region'] and region_filter not in notice['region']:
                        continue
                if biz_type_filter and biz_type_filter != '전체 업종':
                    if notice['biz_type'] and biz_type_filter not in notice['biz_type']:
                        continue

                # 3. 포함 키워드 OR 조건 체크 및 점수 계산
                matched_kws = []
                for ik in include_keywords:
                    if ik and ik in text_to_search:
                        matched_kws.append(ik)
                
                if matched_kws:
                    # 매칭 성공! 점수 계산 (최소 60점 ~ 최대 99점)
                    match_ratio = len(matched_kws) / len(include_keywords)
                    match_score = 60.0 + (match_ratio * 39.0) # 1개라도 맞으면 60점 이상
                    
                    # 중복 저장 방지 (이미 매칭된 경우 스킵)
                    check_sql = "SELECT id FROM match_results WHERE bid_notice_id = %s AND user_match_rule_id = %s"
                    cursor.execute(check_sql, (notice['id'], rule['id']))
                    if not cursor.fetchone():
                        # 저장
                        insert_sql = """
                            INSERT INTO match_results 
                            (bid_notice_id, user_match_rule_id, user_id, match_score, matched_keywords)
                            VALUES (%s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_sql, (
                            notice['id'], rule['id'], rule['user_id'], match_score, ",".join(matched_kws)
                        ))
                        
                        noti_sql = """
                            INSERT INTO app_notifications (user_id, title, message, bid_notice_id)
                            VALUES (%s, %s, %s, %s)
                        """
                        cursor.execute(noti_sql, (
                            rule['user_id'],
                            "새 맞춤 공고",
                            f"[{notice['title']}] 공고가 {int(match_score)}%의 적합도로 매칭되었습니다.",
                            notice['id']
                        ))
                        
                        matched_count += 1
                        
        conn.commit()
        return matched_count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_matched_notices_for_user(user_id):
    """
    대시보드 노출용: 사용자의 매칭된 공고 목록을 점수 순, 최신 순으로 가져옵니다.
    """
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT 
                    n.id, n.title, n.notice_org_name, n.demand_org_name, 
                    n.posted_at, n.deadline_at, n.estimated_price, n.status, n.bid_notice_no, n.bid_notice_ord, n.notice_no,
                    n.region, n.region_name, n.biz_type,
                    mr.match_score, mr.matched_keywords
                FROM match_results mr
                JOIN bid_notices n ON mr.bid_notice_id = n.id
                WHERE mr.user_id = %s
                ORDER BY mr.match_score DESC, n.deadline_at ASC
                LIMIT 100
            """
            cursor.execute(sql, (user_id,))
            return cursor.fetchall()
    finally:
        conn.close()

def run_global_matching():
    """새로운 공고 수집 후 전체 유저의 규칙에 대해 매칭 엔진 가동"""
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id FROM user_match_rules")
            rules = cursor.fetchall()
        
        for r in rules:
            run_match_for_rule(r['id'])
    except Exception as e:
        print("Global matching error:", e)
    finally:
        conn.close()
