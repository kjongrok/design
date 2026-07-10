from flask import Blueprint, jsonify, request

from services.bid_notice_service import BidNoticeService
from services.ai_service import ai_service

bid_notice_bp = Blueprint("bid_notices", __name__)
bid_notice_service = BidNoticeService()


@bid_notice_bp.get("")
def list_bid_notices():
    filters = {
        "keyword": request.args.get("keyword"),
        "region": request.args.get("region"),
        "organization": request.args.get("organization"),
        "biz_type": request.args.get("bizType"),
        "category_depth_1": request.args.get("categoryDepth1"),
        "category_depth_2": request.args.get("categoryDepth2"),
        "category_depth_3": request.args.get("categoryDepth3"),
        "status": request.args.get("status"),
        "min_budget": request.args.get("minBudget"),
        "max_budget": request.args.get("maxBudget"),
        "sort": request.args.get("sort"),
        "period_days": request.args.get("periodDays"),
        "search_mode": request.args.get("searchMode"),
        "limit": request.args.get("limit"),
        "offset": request.args.get("offset"),
    }
    items = bid_notice_service.list_notices(filters)
    total = bid_notice_service.repository.count(filters)
    return jsonify({"items": items, "total": total})


from utils.auth_decorator import require_auth
from services.match_service import get_matched_notices_for_user

@bid_notice_bp.get("/matched")
@require_auth
def get_matched_notices():
    user = request.user
    items = get_matched_notices_for_user(user['sub'])
    return jsonify({"success": True, "items": items})


@bid_notice_bp.get("/<notice_id>")
def get_bid_notice(notice_id):
    notice = bid_notice_service.get_notice(notice_id)
    if notice is None:
        return jsonify({"message": "공고를 찾을 수 없습니다."}), 404
    return jsonify(notice)

@bid_notice_bp.get("/<notice_id>/summary")
def get_notice_summary(notice_id):
    result = ai_service.generate_summary(notice_id)
    return jsonify(result)
