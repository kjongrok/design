import os
import google.generativeai as genai
from core.database import get_connection

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)

    def generate_summary(self, notice_id):
        if not self.api_key:
            return {"success": False, "message": "Gemini API 키가 설정되지 않았습니다."}

        # DB에서 공고 정보 가져오기
        notice = None
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT title, demand_org_name, estimated_price, biz_type, notice_type,
                           product_name, eligible_industry_names, license_limit_text, raw_payload
                    FROM bid_notices WHERE id = %s
                """, (notice_id,))
                notice = cursor.fetchone()

        if not notice:
            return {"success": False, "message": "공고를 찾을 수 없습니다."}

        # 프롬프트 생성
        prompt = f"""
당신은 조달청 나라장터 입찰 전문가입니다.
다음은 입찰 공고의 상세 정보입니다. 바쁜 대표님을 위해 다음 정보를 3가지 항목으로 매우 간결하게 3줄 요약해 주세요.

[공고 정보]
제목: {notice.get('title')}
수요기관: {notice.get('demand_org_name')}
예산(추정가격): {notice.get('estimated_price')}
계약방법: {notice.get('notice_type')}
품명: {notice.get('product_name')}
참가자격(면허): {notice.get('license_limit_text') or notice.get('eligible_industry_names')}
기타정보: {notice.get('raw_payload')[:1000] if notice.get('raw_payload') else '없음'}

[요약 형식] (각 항목당 1문장으로 짧게)
1. 💡 **핵심 과업**: (이 공고가 어떤 물품/용역을 요구하는지 요약)
2. 🎯 **자격 요건**: (참여하기 위해 필요한 핵심 면허나 지역 제한 요약)
3. ⚠️ **주의 사항**: (예산 규모나 특별히 신경써야 할 입찰 방법 요약)
"""

        try:
            valid_model_name = None
            # API 키에 허용된 모델 목록 중 generateContent를 지원하는 gemini 모델을 자동 탐색
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    name = m.name.replace('models/', '')
                    if 'gemini' in name:
                        valid_model_name = name
                        if 'flash' in name:
                            break  # flash 모델을 발견하면 최우선으로 선택

            if not valid_model_name:
                valid_model_name = 'gemini-1.5-flash'  # fallback

            model = genai.GenerativeModel(valid_model_name)
            response = model.generate_content(prompt)
            return {"success": True, "summary": response.text}
        except Exception as e:
            print("AI Summary Error:", e)
            return {"success": False, "message": f"AI 요약 중 오류가 발생했습니다: {str(e)}"}

ai_service = AIService()
