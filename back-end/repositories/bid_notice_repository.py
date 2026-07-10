import json

from core.database import get_connection


class BidNoticeRepository:
    """Repository for collected 나라장터 bid notices."""

    def list(self, filters=None):
        filters = filters or {}
        where = ["1=1"]
        params = []
        
        status = filters.get("status")
        if status and status != "ALL":
            where.append("status = %s")
            params.append(status)

        if filters.get("keyword"):
            search_str = filters['keyword'].replace(" ", "")
            keyword = f"%{search_str}%"
            if filters.get("search_mode") == "ai":
                where.append("""(
                    REPLACE(title, ' ', '') LIKE %s
                    OR REPLACE(COALESCE(match_keywords, ''), ' ', '') LIKE %s
                    OR REPLACE(COALESCE(product_name, ''), ' ', '') LIKE %s
                    OR REPLACE(COALESCE(industry_name, ''), ' ', '') LIKE %s
                )""")
                params.extend([keyword] * 4)
            else:
                where.append("(REPLACE(title, ' ', '') LIKE %s OR REPLACE(match_keywords, ' ', '') LIKE %s)")
                params.extend([keyword, keyword])
        if filters.get("region"):
            keyword = f"%{filters['region']}%"
            where.append("(region_name LIKE %s OR region LIKE %s OR notice_org_name LIKE %s OR demand_org_name LIKE %s)")
            params.extend([keyword, keyword, keyword, keyword])
        if filters.get("organization"):
            keyword = f"%{filters['organization']}%"
            where.append("(notice_org_name LIKE %s OR demand_org_name LIKE %s OR organization LIKE %s)")
            params.extend([keyword, keyword, keyword])
        if filters.get("biz_type"):
            where.append("biz_type = %s")
            params.append(filters["biz_type"])
        if filters.get("category_depth_1"):
            where.append("product_categories.category_depth_1 = %s")
            params.append(filters["category_depth_1"])
        if filters.get("category_depth_2"):
            where.append("product_categories.category_depth_2 = %s")
            params.append(filters["category_depth_2"])
        if filters.get("category_depth_3"):
            where.append("product_categories.category_depth_3 = %s")
            params.append(filters["category_depth_3"])
            
        if filters.get("min_budget"):
            try:
                min_b = int(filters["min_budget"])
                where.append("estimated_price >= %s")
                params.append(min_b)
            except ValueError:
                pass
                
        if filters.get("max_budget"):
            try:
                max_b = int(filters["max_budget"])
                where.append("estimated_price <= %s")
                params.append(max_b)
            except ValueError:
                pass

        if filters.get("period_days"):
            try:
                period_days = max(1, min(int(filters["period_days"]), 3650))
                where.append("bid_notices.posted_at >= DATE_SUB(NOW(), INTERVAL %s DAY)")
                params.append(period_days)
            except ValueError:
                pass

        limit = int(filters.get("limit") or 50)
        offset = int(filters.get("offset") or 0)

        order_by = "bid_notices.posted_at DESC, bid_notices.id DESC"
        if (
            filters.get("sort") == "relevance"
            and filters.get("keyword")
        ):
            relevance_keyword = f"%{filters['keyword'].replace(' ', '')}%"
            order_by = """
                (
                    CASE WHEN REPLACE(bid_notices.title, ' ', '') LIKE %s THEN 100 ELSE 0 END
                    + CASE WHEN REPLACE(COALESCE(bid_notices.match_keywords, ''), ' ', '') LIKE %s THEN 40 ELSE 0 END
                    + CASE WHEN REPLACE(COALESCE(bid_notices.product_name, ''), ' ', '') LIKE %s THEN 30 ELSE 0 END
                    + CASE WHEN REPLACE(COALESCE(bid_notices.industry_name, ''), ' ', '') LIKE %s THEN 20 ELSE 0 END
                ) DESC,
                bid_notices.posted_at DESC,
                bid_notices.id DESC
            """
            params.extend([relevance_keyword] * 4)

        sql = f"""
            SELECT
                bid_notices.id,
                bid_notices.bid_notice_no,
                bid_notices.bid_notice_ord,
                bid_notices.biz_type,
                bid_notices.notice_type,
                bid_notices.title,
                bid_notices.notice_org_name,
                bid_notices.demand_org_name,
                bid_notices.region_name,
                bid_notices.industry_name,
                bid_notices.eligible_industry_codes,
                bid_notices.eligible_industry_names,
                bid_notices.product_category_source_type,
                bid_notices.product_class_no,
                bid_notices.product_name,
                product_categories.category_depth_1,
                product_categories.category_depth_2,
                product_categories.category_depth_3,
                bid_notices.estimated_price,
                bid_notices.base_amount,
                bid_notices.budget_amount,
                bid_notices.posted_at,
                bid_notices.registered_at,
                bid_notices.deadline_at,
                bid_notices.opening_at,
                bid_notices.status,
                bid_notices.detail_url,
                bid_notices.last_synced_at
            FROM bid_notices
            LEFT JOIN product_categories
              ON product_categories.source_type = bid_notices.product_category_source_type
             AND product_categories.product_class_no = bid_notices.product_class_no
            WHERE {" AND ".join(where)}
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()

    def count(self, filters=None):
        filters = filters or {}
        where = ["1=1"]
        params = []
        
        status = filters.get("status")
        if status and status != "ALL":
            where.append("status = %s")
            params.append(status)

        if filters.get("keyword"):
            search_str = filters['keyword'].replace(" ", "")
            keyword = f"%{search_str}%"
            if filters.get("search_mode") == "ai":
                where.append("""(
                    REPLACE(title, ' ', '') LIKE %s
                    OR REPLACE(COALESCE(match_keywords, ''), ' ', '') LIKE %s
                    OR REPLACE(COALESCE(product_name, ''), ' ', '') LIKE %s
                    OR REPLACE(COALESCE(industry_name, ''), ' ', '') LIKE %s
                )""")
                params.extend([keyword] * 4)
            else:
                where.append("(REPLACE(title, ' ', '') LIKE %s OR REPLACE(match_keywords, ' ', '') LIKE %s)")
                params.extend([keyword, keyword])
        if filters.get("region"):
            keyword = f"%{filters['region']}%"
            where.append("(region_name LIKE %s OR region LIKE %s OR notice_org_name LIKE %s OR demand_org_name LIKE %s)")
            params.extend([keyword, keyword, keyword, keyword])
        if filters.get("organization"):
            keyword = f"%{filters['organization']}%"
            where.append("(notice_org_name LIKE %s OR demand_org_name LIKE %s OR organization LIKE %s)")
            params.extend([keyword, keyword, keyword])
        if filters.get("biz_type"):
            where.append("biz_type = %s")
            params.append(filters["biz_type"])
        if filters.get("category_depth_1"):
            where.append("product_categories.category_depth_1 = %s")
            params.append(filters["category_depth_1"])
        if filters.get("category_depth_2"):
            where.append("product_categories.category_depth_2 = %s")
            params.append(filters["category_depth_2"])
        if filters.get("category_depth_3"):
            where.append("product_categories.category_depth_3 = %s")
            params.append(filters["category_depth_3"])
            
        if filters.get("min_budget"):
            try:
                min_b = int(filters["min_budget"])
                where.append("estimated_price >= %s")
                params.append(min_b)
            except ValueError:
                pass
                
        if filters.get("max_budget"):
            try:
                max_b = int(filters["max_budget"])
                where.append("estimated_price <= %s")
                params.append(max_b)
            except ValueError:
                pass

        if filters.get("period_days"):
            try:
                period_days = max(1, min(int(filters["period_days"]), 3650))
                where.append("bid_notices.posted_at >= DATE_SUB(NOW(), INTERVAL %s DAY)")
                params.append(period_days)
            except ValueError:
                pass

        sql = f"""
            SELECT COUNT(DISTINCT bid_notices.id) as total
            FROM bid_notices
            LEFT JOIN product_categories
              ON product_categories.source_type = bid_notices.product_category_source_type
             AND product_categories.product_class_no = bid_notices.product_class_no
            WHERE {" AND ".join(where)}
        """

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                row = cursor.fetchone()
                return row['total'] if row else 0

    def get(self, notice_id):
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM bid_notices WHERE id = %s", (notice_id,))
                notice = cursor.fetchone()

        if notice and isinstance(notice.get("raw_payload"), str):
            try:
                notice["raw_payload"] = json.loads(notice["raw_payload"])
            except json.JSONDecodeError:
                pass
        return notice

    def upsert_many(self, notices):
        if not notices:
            return 0

        columns = [
            "notice_no",
            "bid_notice_no",
            "bid_notice_ord",
            "biz_type",
            "notice_type",
            "title",
            "organization",
            "notice_org_code",
            "notice_org_name",
            "demand_org_code",
            "demand_org_name",
            "region",
            "region_code",
            "region_name",
            "industry_code",
            "industry_name",
            "eligible_industry_codes",
            "eligible_industry_names",
            "license_limit_items",
            "license_limit_raw_payload",
            "license_limit_result_code",
            "license_limit_result_message",
            "product_category_source_type",
            "product_class_no",
            "product_name",
            "base_amount",
            "estimated_price",
            "budget_amount",
            "posted_at",
            "registered_at",
            "deadline_at",
            "opening_at",
            "status",
            "is_deadline_excluded",
            "is_international",
            "license_limit_text",
            "match_keywords",
            "source_url",
            "detail_url",
            "raw_payload",
        ]
        update_columns = [column for column in columns if column != "notice_no"]
        placeholders = ", ".join(["%s"] * len(columns))
        update_sql = ", ".join([f"{column} = VALUES({column})" for column in update_columns])

        sql = f"""
            INSERT INTO bid_notices ({", ".join(columns)})
            VALUES ({placeholders})
            ON DUPLICATE KEY UPDATE
                {update_sql},
                last_synced_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        """

        values = []
        for notice in notices:
            row = []
            for column in columns:
                value = notice.get(column)
                if column in ("raw_payload", "license_limit_items", "license_limit_raw_payload") and value is not None:
                    value = json.dumps(value, ensure_ascii=False)
                row.append(value)
            values.append(row)

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.executemany(sql, values)
            connection.commit()
        return len(notices)

    def upsert_product_categories(self, categories):
        if not categories:
            return 0

        columns = [
            "source_type",
            "product_class_no",
            "category_depth_1",
            "category_depth_2",
            "category_depth_3",
            "description",
        ]
        placeholders = ", ".join(["%s"] * len(columns))
        update_columns = [
            "category_depth_1",
            "category_depth_2",
            "category_depth_3",
            "description",
        ]
        update_sql = ", ".join([f"{column} = VALUES({column})" for column in update_columns])

        sql = f"""
            INSERT INTO product_categories ({", ".join(columns)})
            VALUES ({placeholders})
            ON DUPLICATE KEY UPDATE
                {update_sql},
                updated_at = CURRENT_TIMESTAMP
        """

        seen = set()
        values = []
        for category in categories:
            key = (category.get("source_type"), category.get("product_class_no"))
            if not key[0] or not key[1] or key in seen:
                continue
            seen.add(key)
            values.append([category.get(column) for column in columns])

        if not values:
            return 0

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.executemany(sql, values)
            connection.commit()
        return len(values)

    def close_expired_notices(self):
        sql = """
            UPDATE bid_notices
            SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
            WHERE status = 'OPEN'
              AND deadline_at IS NOT NULL
              AND deadline_at <= CURRENT_TIMESTAMP
        """
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                affected = cursor.rowcount
            connection.commit()
        return affected

    def list_license_limit_backfill_targets(self, limit=100):
        sql = """
            SELECT
                id,
                bid_notice_no,
                bid_notice_ord,
                title
            FROM bid_notices
            WHERE status = 'OPEN'
              AND bid_notice_no IS NOT NULL
              AND (
                    eligible_industry_codes IS NULL
                 OR eligible_industry_codes = ''
                 OR license_limit_items IS NULL
                 OR license_limit_items = '[]'
              )
            ORDER BY id ASC
            LIMIT %s
        """
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, (int(limit),))
                return cursor.fetchall()

    def update_license_limit(self, notice_id, values):
        sql = """
            UPDATE bid_notices
            SET
                industry_code = %s,
                industry_name = %s,
                eligible_industry_codes = %s,
                eligible_industry_names = %s,
                license_limit_items = %s,
                license_limit_raw_payload = %s,
                license_limit_result_code = %s,
                license_limit_result_message = %s,
                license_limit_text = %s,
                match_keywords = TRIM(CONCAT_WS(' ', match_keywords, %s, %s)),
                last_synced_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """
        license_limit_items = values.get("license_limit_items")
        if license_limit_items is not None:
            license_limit_items = json.dumps(license_limit_items, ensure_ascii=False)
        license_limit_raw_payload = values.get("license_limit_raw_payload")
        if license_limit_raw_payload is not None:
            license_limit_raw_payload = json.dumps(license_limit_raw_payload, ensure_ascii=False)

        params = (
            values.get("industry_code"),
            values.get("industry_name"),
            values.get("eligible_industry_codes"),
            values.get("eligible_industry_names"),
            license_limit_items,
            license_limit_raw_payload,
            values.get("license_limit_result_code"),
            values.get("license_limit_result_message"),
            values.get("license_limit_text"),
            values.get("eligible_industry_codes"),
            values.get("eligible_industry_names"),
            notice_id,
        )

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                affected = cursor.rowcount
            connection.commit()
        return affected
