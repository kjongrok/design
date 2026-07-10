import axios from 'axios';

// 기존 데이터가 로컬 스토리지에 이미 생성되어 있을 경우를 대비한 관심공고 강제 시딩 보정
try {
  const existingNotices = localStorage.getItem('mock_notices');
  if (existingNotices) {
    const parsed = JSON.parse(existingNotices);
    let isChanged = false;
    parsed.forEach(n => {
      if ((n.id === 1 || n.id === 8) && !n.is_interest) {
        n.is_interest = true;
        isChanged = true;
      }
    });
    if (isChanged) {
      localStorage.setItem('mock_notices', JSON.stringify(parsed));
    }
  }
} catch (e) {
  console.error("관심공고 강제 시딩 실패:", e);
}

// -------------------------------------------------------------
// 1. 시연용 가상 데이터베이스 초기화 및 데이터 시딩 (Seeding)
// -------------------------------------------------------------
const seedMockDatabase = () => {
  const generalMember = {
    id: 5,
    email: 'member@bidmatch.com',
    name: '이민준',
    role: 'USER',
    phone: '010-2468-1357',
    company_name: '',
    business_registration_no: '',
    business_type: '',
    is_youth_company: 0,
    is_woman_company: 0,
    is_disabled_company: 0,
    license_codes: '',
    license_names: '',
    is_verified: 0,
    verification_status: 'NONE',
    created_at: '2026-07-09T10:00:00Z',
    status: 'active',
    performances: []
  };

  const restrictedMembers = [
    {
      id: 6,
      email: 'blocked@bidmatch.com',
      name: '정지 테스트',
      role: 'USER',
      phone: '010-1111-2222',
      company_name: '',
      business_registration_no: '',
      business_type: '',
      is_youth_company: 0,
      is_woman_company: 0,
      is_disabled_company: 0,
      license_codes: '',
      license_names: '',
      is_verified: 0,
      verification_status: 'NONE',
      created_at: '2026-07-09T11:00:00Z',
      status: 'blocked',
      performances: []
    },
    {
      id: 7,
      email: 'dormant@bidmatch.com',
      name: '휴면 테스트',
      role: 'USER',
      phone: '010-3333-4444',
      company_name: '',
      business_registration_no: '',
      business_type: '',
      is_youth_company: 0,
      is_woman_company: 0,
      is_disabled_company: 0,
      license_codes: '',
      license_names: '',
      is_verified: 0,
      verification_status: 'NONE',
      created_at: '2026-07-09T12:00:00Z',
      status: 'dormant',
      performances: []
    }
  ];

  if (localStorage.getItem('mock_init_v2')) {
    const savedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const requiredUsers = [generalMember, ...restrictedMembers];
    let changed = false;
    requiredUsers.forEach(requiredUser => {
      if (!savedUsers.some(user => user.email === requiredUser.email)) {
        savedUsers.push(requiredUser);
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('mock_users', JSON.stringify(savedUsers));
    }
    return;
  }

  const defaultUser = {
    id: 2,
    email: 'user@bidmatch.com',
    name: '김종록 대표',
    role: 'USER', // 'USER'(일반) -> 기업 등록/인증 후 'COMPANY'로 전환
    phone: '010-1234-5678',
    company_name: '(주)비드매치',
    business_registration_no: '123-45-67890',
    business_type: '서비스/SW',
    is_youth_company: 1,
    is_woman_company: 0,
    is_disabled_company: 0,
    license_codes: '1468', // 소프트웨어사업자(컴퓨터관련서비스업)
    license_names: '소프트웨어사업자(컴퓨터관련서비스업)',
    is_verified: 0,
    verification_status: 'NONE', // NONE, PENDING, APPROVED, REJECTED
    created_at: '2026-07-01T09:00:00Z',
    status: 'active',
    performances: [
      { id: 1, title: '2025년 지자체 스마트 주차장 모바일 앱 개발', client: '인천광역시 남동구', amount: 150000000, date: '2025-11-20' },
      { id: 2, title: '공공 클라우드 아키텍처 기술 지원 컨설팅', client: '한국지능정보사회진흥원', amount: 80000000, date: '2026-02-15' }
    ]
  };

  const adminUser = {
    id: 1,
    email: 'admin@bidmatch.com',
    name: '관리자',
    role: 'ADMIN',
    phone: '010-0000-0000',
    company_name: '관리본부',
    business_registration_no: '000-00-00000',
    is_verified: 1,
    verification_status: 'APPROVED',
    created_at: '2026-06-01T00:00:00Z',
    status: 'active',
    performances: []
  };

  const otherUsers = [
    generalMember,
    ...restrictedMembers,
    {
      id: 3,
      email: 'hong@kildong.com',
      name: '홍길동 대표',
      role: 'COMPANY',
      phone: '010-9876-5432',
      company_name: '(주)길동테크',
      business_registration_no: '987-65-43210',
      business_type: '제조/IT',
      is_youth_company: 0,
      is_woman_company: 0,
      is_disabled_company: 0,
      license_codes: '1426,6502',
      license_names: '소프트웨어사업자(패키지소프트웨어개발·공급사업),정보통신공사업',
      is_verified: 1,
      verification_status: 'APPROVED',
      created_at: '2026-07-03T14:30:00Z',
      status: 'active',
      performances: []
    },
    {
      id: 4,
      email: 'ceo@womensw.com',
      name: '이지현 사장',
      role: 'USER',
      phone: '010-5555-1234',
      company_name: '우먼소프트',
      business_registration_no: '246-81-01234',
      business_type: '서비스/IT컨설팅',
      is_youth_company: 0,
      is_woman_company: 1,
      is_disabled_company: 0,
      license_codes: '1468',
      license_names: '소프트웨어사업자(컴퓨터관련서비스업)',
      is_verified: 0,
      verification_status: 'PENDING',
      created_at: '2026-07-07T10:15:00Z',
      status: 'active',
      performances: []
    }
  ];

  const defaultRules = [
    {
      id: 1,
      keyword_include: '유지관리,구축,시스템,AI,클라우드',
      keyword_exclude: '폐기물,건설,청소',
      regions: '서울,경기,인천,전국',
      industries: '소프트웨어사업자(컴이지관련서비스업),정보통신공사업'
    }
  ];

  // 사실적 공고 데이터 (10건 이상)
  // user의 면허: 1468 컴퓨터관련서비스업, 주소: 서울, 실적: 1.5억 & 0.8억 = 2.3억 누적
  const notices = [
    {
      id: 1,
      notice_no: "20260710001",
      bid_notice_no: "20260710001",
      bid_notice_ord: "00",
      title: "2026년 서울특별시 공공 통합 정보시스템 유지관리 및 기술지원 용역",
      notice_org_name: "서울특별시",
      demand_org_name: "서울특별시 정보기획과",
      estimated_price: "540000000",
      budget_amount: "540000000",
      registered_at: "2026-07-01T10:00:00Z",
      deadline_at: "2026-07-15T18:00:00Z",
      biz_type: "용역",
      notice_type: "제한경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 98,
      matched_keywords: "유지관리,정보시스템,기술지원",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업)",
      area_limits: "서울특별시",
      limit_performance_amount: 200000000, // 요구실적 2억 (당사 실적 합산 2.3억으로 합격)
      is_interest: true,
      summary: "1. 서울특별시 본청 및 사업소의 통합 정보시스템을 안정적으로 유지관리하는 사업입니다.\n2. 총 예산은 약 5.4억 원(VAT 포함)이며, 사업 기간은 착수일로부터 12개월입니다.\n3. 주사업장이 서울특별시에 소재하고 소프트웨어사업자(컴퓨터관련서비스업) 면허를 보유한 업체만 입찰이 가능합니다."
    },
    {
      id: 2,
      notice_no: "20260710002",
      bid_notice_no: "20260710002",
      bid_notice_ord: "00",
      title: "차세대 스마트 교육 플랫폼 구축용 하드웨어 및 솔루션 도입",
      notice_org_name: "경기도교육청",
      demand_org_name: "경기도교육청 교육정보원",
      estimated_price: "1200000000",
      budget_amount: "1200000000",
      registered_at: "2026-07-02T09:00:00Z",
      deadline_at: "2026-07-20T17:00:00Z",
      biz_type: "물품",
      notice_type: "제한(총액)협상에의한계약",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 92,
      matched_keywords: "스마트 교육,하드웨어,솔루션",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업), 6502:정보통신공사업",
      area_limits: "전국",
      limit_performance_amount: 500000000, // 요구실적 5억 (당사 실적 2.3억으로 불합격)
      summary: "1. 경기도교육청 내 차세대 스마트 교육 인프라 구축을 위한 서버 및 솔루션을 일괄 도입합니다.\n2. 총 도입 예산은 12억 원이며, 납품 기한은 계약일로부터 150일입니다.\n3. 정보통신공사업 및 소프트웨어사업자 면허를 필수로 요구하며, 대기업 참여는 제한됩니다."
    },
    {
      id: 3,
      notice_no: "20260710003",
      bid_notice_no: "20260710003",
      bid_notice_ord: "00",
      title: "지자체 스마트 CCTV 관제 시스템 고도화 사업 및 AI 서버 구매",
      notice_org_name: "인천광역시 서구",
      demand_org_name: "인천광역시 서구 안전총괄과",
      estimated_price: "720000000",
      budget_amount: "720000000",
      registered_at: "2026-07-05T15:00:00Z",
      deadline_at: "2026-07-25T11:00:00Z",
      biz_type: "물품",
      notice_type: "일반경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 80,
      matched_keywords: "관제 시스템,AI 서버",
      license_limits: "6502:정보통신공사업", // 정보통신공사 면허 없음으로 불합격
      area_limits: "인천광역시",
      limit_performance_amount: 100000000,
      summary: "1. 지자체 방범 CCTV 시스템의 이상행동 자동 감지 알고리즘 적용 및 AI 전용 서버 도입 사업입니다.\n2. 사업 규모는 약 7.2억 원이며, 정보통신공사업 자격을 필수적으로 요구합니다.\n3. 인천광역시에 주된 영업소를 둔 업체에 한해 입찰 참여가 허용됩니다."
    },
    {
      id: 4,
      notice_no: "20260710004",
      bid_notice_no: "20260710004",
      bid_notice_ord: "00",
      title: "2026년 공공 클라우드 전환 컨설팅 및 인프라 설계 사업",
      notice_org_name: "한국지능정보사회진흥원",
      demand_org_name: "한국지능정보사회진흥원 클라우드기획팀",
      estimated_price: "350000000",
      budget_amount: "350000000",
      registered_at: "2026-07-04T13:30:00Z",
      deadline_at: "2026-07-10T15:00:00Z",
      biz_type: "용역",
      notice_type: "제한경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 95,
      matched_keywords: "클라우드,컨설팅,인프라",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업)",
      area_limits: "대구광역시", // 대구광역시 소재지 제한으로 불합격
      limit_performance_amount: 100000000,
      summary: "1. 공공부문 정보시스템의 민간 클라우드 전환을 위한 사전 타당성 분석 및 인프라 설계 사업입니다.\n2. 예산은 3.5억 원이며, 사업 수행 기간은 착수일로부터 6개월입니다.\n3. 컴퓨터관련서비스업 소프트웨어사업자 면허가 필요하며, 지역 제한은 대구광역시입니다."
    },
    {
      id: 5,
      notice_no: "20260710005",
      bid_notice_no: "20260710005",
      bid_notice_ord: "01",
      title: "AI 기반 맞춤형 공고 매칭 알고리즘 고도화 연구 용역",
      notice_org_name: "조달청",
      demand_org_name: "조달청 정보기획과",
      estimated_price: "150000000",
      budget_amount: "150000000",
      registered_at: "2026-07-03T11:00:00Z",
      deadline_at: "2026-07-08T18:00:00Z",
      biz_type: "용역",
      notice_type: "수의계약 (연구 용역)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 85,
      matched_keywords: "AI,알고리즘,매칭",
      license_limits: "1426:소프트웨어사업자(패키지소프트웨어개발·공급사업)", // 패키지사업자 면허 없음으로 불합격
      area_limits: "전국",
      limit_performance_amount: 50000000,
      summary: "1. 나라장터 맞춤형 공고 매칭 및 정확도 고도화를 위한 AI 매칭 알고리즘 연구 용역입니다.\n2. 추정 예산은 1.5억 원이며, 주관 연구기관 등 IT 연구소 참여가 가능합니다.\n3. 패키지소프트웨어개발공급업 등의 면허가 요구되며, 전국 단위 입찰이 가능합니다."
    },
    {
      id: 6,
      notice_no: "20260710006",
      bid_notice_no: "20260710006",
      bid_notice_ord: "00",
      title: "문화체육관광부 통합 포털 모바일 반응형 웹 전면 개편 사업",
      notice_org_name: "문화체육관광부",
      demand_org_name: "문화체육관광부 정책홍보팀",
      estimated_price: "480000000",
      budget_amount: "480000000",
      registered_at: "2026-07-06T14:00:00Z",
      deadline_at: "2026-07-28T14:00:00Z",
      biz_type: "용역",
      notice_type: "제한경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 93,
      matched_keywords: "포털,반응형 웹,개편",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업), 1169:산업디자인전문회사", // 산업디자인 면허 없음으로 불합격
      area_limits: "전국",
      limit_performance_amount: 150000000,
      summary: "1. 문화체육관광부 통합 포털의 대국민 서비스 향상을 위해 모바일 중심의 반응형 웹 시스템을 도입하는 사업입니다.\n2. 예산은 4.8억 원이며, 2026년 말 완료를 목표로 합니다.\n3. 컴퓨터관련서비스업 및 산업디자인전문회사(멀티미디어디자인) 면허 소지자가 대상입니다."
    },
    {
      id: 7,
      notice_no: "20260710007",
      bid_notice_no: "20260710007",
      bid_notice_ord: "00",
      title: "스마트시티 교통 데이터 허브 구축 사업 및 통합 플랫폼 연계",
      notice_org_name: "경기도",
      demand_org_name: "경기도 교통정보센터",
      estimated_price: "2500000000",
      budget_amount: "2500000000",
      registered_at: "2026-07-03T18:00:00Z",
      deadline_at: "2026-07-09T18:00:00Z",
      biz_type: "용역",
      notice_type: "제한경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 88,
      matched_keywords: "스마트시티,교통 데이터,통합 플랫폼",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업), 6502:정보통신공사업", // 정보통신공사 면허 누락 및 예산 실적 부족으로 불합격
      area_limits: "경기도",
      limit_performance_amount: 1000000000, // 요구 실적 10억
      summary: "1. 경기도 스마트시티 교통 정보 연계를 위한 실시간 교통 빅데이터 허브 인프라 구축 용역입니다.\n2. 총 예산 25억 원이며, 기간은 계약일로부터 18개월입니다.\n3. 소프트웨어 및 정보통신공사업 자격을 필요로 하며 단일 실적 10억 원 이상 제출 필수입니다."
    },
    {
      id: 8,
      notice_no: "20260710008",
      bid_notice_no: "20260710008",
      bid_notice_ord: "00",
      title: "2026 하반기 지자체 업무포털 가상화 솔루션 도입 및 검증",
      notice_org_name: "충청남도",
      demand_org_name: "충청남도 정보화담당관",
      estimated_price: "180000000",
      budget_amount: "180000000",
      registered_at: "2026-07-05T10:00:00Z",
      deadline_at: "2026-07-12T10:00:00Z",
      biz_type: "물품",
      notice_type: "제한경쟁 (협상에 의한 계약)",
      detail_url: "https://www.g2b.go.kr",
      status: "OPEN",
      match_score: 96,
      matched_keywords: "업무포털,가상화,솔루션",
      license_limits: "1468:소프트웨어사업자(컴퓨터관련서비스업)",
      area_limits: "전국",
      limit_performance_amount: 50000000, // 요구실적 5천만원 (합격)
      is_interest: true,
      summary: "1. 지자체 내부 직원용 가상화 포털 솔루션 라이선스 도입 및 보안 검증 적용 사업입니다.\n2. 추정 예산은 1.8억 원이며, 낙찰 후 60일 이내에 구축을 완료해야 합니다.\n3. 소프트웨어사업자(컴퓨터관련서비스업) 업종을 등록한 업체로서 전지역 경쟁이 허용됩니다."
    }
  ];

  // 사전규격 데이터 (5건 이상)
  const specifications = [
    {
      id: 1,
      spec_no: "SPEC-2026-0701",
      title: "2026년 국세청 빅데이터 플랫폼 통합 인프라 증설 규격서",
      org_name: "국세청",
      estimated_price: 1500000000,
      posted_at: "2026-07-01",
      deadline_at: "2026-07-14",
      biz_type: "정보화",
      summary: "국세청 빅데이터 시스템의 노후 장비 개체 및 클라우드 인프라 아키텍처 2단계 확장을 위한 하드웨어 및 미들웨어 성능 명세 규격서입니다."
    },
    {
      id: 2,
      spec_no: "SPEC-2026-0702",
      title: "한국부동산원 청사 스마트 빌딩 관리 솔루션 시범 도입",
      org_name: "한국부동산원",
      estimated_price: 250000000,
      posted_at: "2026-07-02",
      deadline_at: "2026-07-11",
      biz_type: "소프트웨어개발",
      summary: "본원 청사 내 에너지 효율화 및 시설 관리를 위한 IoT 기반 지능형 건물 관리 플랫폼 시범 도입 사전규격 설명서입니다."
    },
    {
      id: 3,
      spec_no: "SPEC-2026-0703",
      title: "지능형 교통체계(ITS) 고도화 사업 사전 성능 규격서",
      org_name: "부산광역시",
      estimated_price: 980000000,
      posted_at: "2026-07-03",
      deadline_at: "2026-07-13",
      biz_type: "정보통신공사",
      summary: "주요 도심 교차로 내 실시간 교통량 감지를 위한 다차선 레이다 센서 및 AI 신호 제어 인터페이스 연계 규격에 관한 규격입니다."
    },
    {
      id: 4,
      spec_no: "SPEC-2026-0704",
      title: "2026년 기상청 기상 위성 데이터 수집 시스템 용역 사전규격",
      org_name: "기상청",
      estimated_price: 420000000,
      posted_at: "2026-07-04",
      deadline_at: "2026-07-15",
      biz_type: "정보화",
      summary: "천리안 위성 데이터의 신속한 전송 및 수집 처리를 위한 고성능 분석 스토리지 인프라 확장을 골자로 하는 제안요구조건서입니다."
    },
    {
      id: 5,
      spec_no: "SPEC-2026-0705",
      title: "공공 의료원 모바일 예약 서비스 표준 가이드라인 플랫폼 도입",
      org_name: "국민건강보험공단 일산병원",
      estimated_price: 180000000,
      posted_at: "2026-07-05",
      deadline_at: "2026-07-10",
      biz_type: "소프트웨어개발",
      summary: "환자용 카카오톡 알림 및 실시간 외래 진료 모바일 연계 예약 기능 모듈 개발에 필요한 필수 기능요구 사양 명세입니다."
    }
  ];

  // 개찰결과 데이터 (5건 이상)
  const bidResults = [
    {
      id: 1,
      notice_no: "20260601245-00",
      title: "2026년 한국철도공사 업무용 PC 및 정보통신장비 유지보수 용역",
      org_name: "한국철도공사",
      winner_name: "(주)씨앤에스정보기술",
      winning_amount: 840250000,
      success_rate: 87.94,
      estimated_price: 955420000,
      opened_at: "2026-07-06 15:00"
    },
    {
      id: 2,
      notice_no: "20260603412-00",
      title: "행정안전부 정부디지털지방정부 포털 고도화 및 DB 정비 사업",
      org_name: "조달청 (행정안전부 수요)",
      winner_name: "(주)에스넷시스템",
      winning_amount: 3120450000,
      success_rate: 92.15,
      estimated_price: 3386000000,
      opened_at: "2026-07-05 11:00"
    },
    {
      id: 3,
      notice_no: "20260602058-00",
      title: "대구광역시 지능형 가로등 제어 시스템용 소프트웨어 구매",
      org_name: "대구광역시",
      winner_name: "(주)유비쿼터스코리아",
      winning_amount: 285000000,
      success_rate: 86.42,
      estimated_price: 3298000000,
      opened_at: "2026-07-04 16:30"
    },
    {
      id: 4,
      notice_no: "20260601994-00",
      title: "국립농산물품질관리원 모바일 현장 조사 단말기 및 솔루션 도입",
      org_name: "조달청",
      winner_name: "(주)케이티",
      winning_amount: 688000000,
      success_rate: 89.20,
      estimated_price: 771300000,
      opened_at: "2026-07-03 10:00"
    },
    {
      id: 5,
      notice_no: "20260601552-01",
      title: "서울종합방재센터 노후 재난 영상 전송 시스템 개체 공사",
      org_name: "서울종합방재센터",
      winner_name: "(주)삼우정보통신",
      winning_amount: 1154000000,
      success_rate: 87.55,
      estimated_price: 1318000000,
      opened_at: "2026-07-02 15:30"
    }
  ];

  const notifications = [
    {
      id: 1,
      bid_notice_id: 1,
      title: "신규 맞춤 공고 매칭",
      message: "[서울특별시] '2026년 서울특별시 공공 통합 정보시스템 유지관리 및 기술지원 용역' 공고가 등록되었습니다. (일치도: 98%)",
      is_read: false,
      created_at: "2026-07-08T09:15:00Z"
    },
    {
      id: 2,
      bid_notice_id: 8,
      title: "신규 맞춤 공고 매칭",
      message: "[충청남도] '2026 하반기 지자체 업무포털 가상화 솔루션 도입 및 검증' 공고가 등록되었습니다. (일치도: 96%)",
      is_read: false,
      created_at: "2026-07-08T08:30:00Z"
    },
    {
      id: 3,
      bid_notice_id: 2,
      title: "마감 임박 공고 알림",
      message: "[경기도교육청] '차세대 스마트 교육 플랫폼 구축용 하드웨어 및 솔루션 도입' 마감이 12일 남았습니다.",
      is_read: true,
      created_at: "2026-07-07T18:00:00Z"
    }
  ];

  const adminLogs = [
    { id: 1, type: 'success', title: '나라장터 수집 크롤러 구동 완료', message: '용역 및 물품 공고 42건 정상 수집 및 동기화 처리 완료.', date: '2026-07-08', time: '10:00:00' },
    { id: 2, type: 'info', title: 'admin@bidmatch.com 로그인', message: '관리자 계정으로 시스템 어드민에 접속하였습니다.', date: '2026-07-08', time: '09:30:00' },
    { id: 3, type: 'warning', title: '나라장터 API 제한 지연 재시도', message: 'API Gateway 호출 제한으로 1.0초 대기 후 재시도 통과.', date: '2026-07-08', time: '09:00:03' },
    { id: 4, type: 'success', title: '자동 이메일 다이제스트 전송', message: '조건 일치 기업 회원 4명에게 맞춤형 요약 이메일 전송 완료 (Gmail SMTP).', date: '2026-07-08', time: '08:05:00' }
  ];

  // 자격진단 검수 큐 데이터
  const verificationQueue = [
    {
      id: 1,
      notice_no: "20260710009",
      title: "2026 국립중앙도서관 전자도서 관리용 메타데이터 정비 용역",
      license_raw: "학술.연구용역(업종코드 1196) 또는 소프트웨어사업자(업종코드 1468)",
      extracted_licenses: "1196,1468",
      area_raw: "전국",
      extracted_area: "전국",
      confidence: 81, // 85% 미만이라 큐에 오름
      status: "PENDING"
    },
    {
      id: 2,
      notice_no: "20260710010",
      title: "한국세라믹기술원 노후 통신 보안 장비 고도화 구축 공사",
      license_raw: "정보통신공사업(업종코드 6502) 면허 필수 소지",
      extracted_licenses: "6502",
      area_raw: "경상남도 진주시 제한",
      extracted_area: "진주시",
      confidence: 79,
      status: "PENDING"
    }
  ];

  localStorage.setItem('mock_users', JSON.stringify([defaultUser, adminUser, ...otherUsers]));
  localStorage.setItem('mock_rules', JSON.stringify(defaultRules));
  localStorage.setItem('mock_notices', JSON.stringify(notices));
  localStorage.setItem('mock_specifications', JSON.stringify(specifications));
  localStorage.setItem('mock_bid_results', JSON.stringify(bidResults));
  localStorage.setItem('mock_notifications', JSON.stringify(notifications));
  localStorage.setItem('mock_admin_logs', JSON.stringify(adminLogs));
  localStorage.setItem('mock_verification_queue', JSON.stringify(verificationQueue));
  localStorage.setItem('mock_init_v2', 'true');
};

seedMockDatabase();

// -------------------------------------------------------------
// 2. Custom Axios Adapter 구현 (HTTP 모킹)
// -------------------------------------------------------------
const getMockData = (key) => JSON.parse(localStorage.getItem(key));
const setMockData = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const mockAdapter = async (config) => {
  const url = config.url.replace(/^\/api/, ''); // 접두사 제거
  const method = config.method.toLowerCase();
  
  // 로그인 검증을 위한 토큰 파싱
  const token = config.headers?.Authorization?.split(' ')[1] || localStorage.getItem('token');
  const loggedInUser = token 
    ? getMockData('mock_users').find(u => u.email === token.replace('_token', ''))
    : null;

  let responseData = null;
  let status = 200;

  // 헬퍼: URL 매칭
  const isMatch = (pathPattern) => {
    const cleanUrl = url.split('?')[0];
    const regexStr = '^' + pathPattern.replace(/\/:[^\/]+/g, '/([^/]+)') + '$';
    return cleanUrl.match(new RegExp(regexStr));
  };

  const getUrlParam = (pathPattern) => {
    const cleanUrl = url.split('?')[0];
    const regexStr = '^' + pathPattern.replace(/\/:[^\/]+/g, '/([^/]+)') + '$';
    const match = cleanUrl.match(new RegExp(regexStr));
    return match ? match[1] : null;
  };

  const getQueryParams = () => {
    if (!url.includes('?')) return {};
    const search = url.split('?')[1];
    return Object.fromEntries(new URLSearchParams(search));
  };

  try {
    // A. 인증 및 내 정보 API (/auth/*)
    if (isMatch('/auth/login') && method === 'post') {
      const { email } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const user = users.find(u => u.email === email);
      if (user?.status === 'blocked') {
        status = 403;
        responseData = {
          success: false,
          account_status: 'blocked',
          message: '현재 계정은 정지 상태로 로그인이 제한되었습니다. 고객센터로 문의해 주세요.',
        };
      } else if (user?.status === 'dormant') {
        status = 403;
        responseData = {
          success: false,
          account_status: 'dormant',
          message: '현재 계정은 휴면 상태로 로그인이 제한되었습니다. 휴면 해제 문의를 접수해 주세요.',
        };
      } else if (user) {
        responseData = { success: true, token: `${email}_token`, user };
      } else {
        status = 400;
        responseData = { success: false, message: '이메일 주소 또는 비밀번호가 올바르지 않습니다.' };
      }
    } 
    else if (isMatch('/auth/signup') && method === 'post') {
      const { email, name, company_name, business_registration_no, company, business_verification_status } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      if (users.find(u => u.email === email)) {
        status = 400;
        responseData = { success: false, message: '이미 등록된 이메일 주소입니다.' };
      } else {
        const newUser = {
          id: Date.now(),
          email,
          name,
          role: 'USER',
          phone: '',
          company_name: company_name || '',
          business_registration_no: business_registration_no || '',
          business_type: company?.businessStatus || '',
          industry: company?.industry || '',
          address: company?.address || '',
          ceo_name: company?.ceoName || '',
          representative_phone: company?.representativePhone || '',
          company_phone: company?.phone || '',
          is_small_business: company?.isSmallBusiness === '있음' ? 1 : 0,
          is_youth_company: company?.preferredPolicyTypes?.includes('청년') ? 1 : 0,
          is_woman_company: company?.preferredPolicyTypes?.includes('여성') ? 1 : 0,
          is_disabled_company: company?.preferredPolicyTypes?.includes('장애') ? 1 : 0,
          license_codes: '',
          license_names: company?.licenseSummary || '',
          is_verified: company?.businessVerified ? 1 : 0,
          verification_status: business_verification_status || 'NONE',
          business_license_file_name: company?.businessLicenseFileName || '',
          created_at: new Date().toISOString(),
          status: 'active',
          performances: []
        };
        users.push(newUser);
        setMockData('mock_users', users);
        responseData = { success: true, message: '회원가입이 완료되었습니다.' };
      }
    }
    else if (isMatch('/auth/reset-password-request') && method === 'post') {
      responseData = { success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' };
    }
    else if (isMatch('/auth/me') && method === 'get') {
      if (loggedInUser) {
        responseData = { success: true, user: loggedInUser };
      } else {
        status = 401;
        responseData = { success: false, message: '로그인이 필요합니다.' };
      }
    }
    else if (isMatch('/auth/me') && method === 'put') { // 내 개인정보 수정
      const { name } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === loggedInUser.id);
      if (idx !== -1) {
        users[idx].name = name;
        setMockData('mock_users', users);
        responseData = { success: true, user: users[idx] };
      }
    }
    else if (isMatch('/auth/me/company') && method === 'put') { // 기업정보 및 면허 갱신
      const companyData = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === loggedInUser.id);
      if (idx !== -1) {
        const licCodes = companyData.licenses.map(l => l.code).join(',');
        const licNames = companyData.licenses.map(l => l.name).join(',');
        
        users[idx] = {
          ...users[idx],
          company_name: companyData.company_name,
          business_registration_no: companyData.business_registration_no,
          business_type: companyData.business_type,
          industry: companyData.industry,
          address: companyData.address,
          detail_address: companyData.detail_address,
          ceo_name: companyData.ceo_name,
          representative_phone: companyData.representative_phone,
          company_phone: companyData.phone,
          is_small_business: companyData.is_small_business === '있음' ? 1 : 0,
          is_youth_company: companyData.is_youth_company,
          is_woman_company: companyData.is_woman_company,
          is_disabled_company: companyData.is_disabled_company,
          license_codes: licCodes,
          license_names: licNames,
          business_license_file_name: companyData.business_license_file_name,
          performances: companyData.performances || users[idx].performances || []
        };
        setMockData('mock_users', users);
        responseData = { success: true, message: '기업 정보가 성공적으로 반영되었습니다.', user: users[idx] };
      }
    }
    else if (isMatch('/auth/me/password') && method === 'put') {
      responseData = { success: true, message: '비밀번호가 변경되었습니다.' };
    }
    else if (isMatch('/auth/verify-business') && method === 'post') {
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === loggedInUser.id);
      if (idx !== -1) {
        users[idx].is_verified = 1;
        setMockData('mock_users', users);
      }
      responseData = { success: true, message: '사업자등록번호 유효성 검증이 완료되었습니다. 기업회원 승격은 관리자 검수 후 처리됩니다.' };
    }
    else if (isMatch('/auth/upload-verification-doc') && method === 'post') {
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === loggedInUser.id);
      if (idx !== -1) {
        users[idx].verification_status = 'PENDING';
        setMockData('mock_users', users);
      }
      responseData = { success: true, message: '증빙서류가 접수되어 승인 대기 상태로 전환되었습니다.' };
    }
    else if (isMatch('/auth/me') && method === 'delete') {
      const users = getMockData('mock_users').filter(u => u.id !== loggedInUser.id);
      setMockData('mock_users', users);
      responseData = { success: true, message: '계정 탈퇴 완료' };
    }
    
    // B. 공고 관련 API (/bid-notices/*)
    else if (isMatch('/bid-notices/matched') && method === 'get') {
      const notices = getMockData('mock_notices');
      const matched = notices.map(n => {
        let score = 90 + Math.floor(Math.random() * 9);
        if (n.license_limits && loggedInUser?.license_codes) {
          const limits = n.license_limits.split(',').map(l => l.split(':')[0].trim());
          const userCodes = loggedInUser.license_codes.split(',');
          const hasLicense = limits.some(code => userCodes.includes(code));
          if (!hasLicense) score -= 15;
        }
        return { ...n, match_score: score };
      }).sort((a,b) => b.match_score - a.match_score);
      
      responseData = { success: true, items: matched };
    }
    else if (isMatch('/bid-notices') && method === 'get') {
      const params = getQueryParams();
      let notices = getMockData('mock_notices');
      
      if (params.query) {
        notices = notices.filter(n => n.title.includes(params.query) || n.notice_org_name.includes(params.query));
      }
      if (params.biz_type && params.biz_type !== 'ALL') {
        notices = notices.filter(n => n.biz_type === params.biz_type);
      }
      if (params.status && params.status !== 'ALL') {
        notices = notices.filter(n => n.status === params.status);
      }
      if (params.area && params.area !== '전국') {
        notices = notices.filter(n => n.area_limits.includes(params.area) || n.area_limits === '전국');
      }

      responseData = {
        success: true,
        items: notices,
        total: notices.length
      };
    }
    else if (isMatch('/bid-notices/:id/summary') && method === 'get') {
      await new Promise(r => setTimeout(r, 600));
      const id = getUrlParam('/bid-notices/:id/summary');
      const notice = getMockData('mock_notices').find(n => n.id === parseInt(id));
      if (notice) {
        responseData = { success: true, summary: notice.summary };
      } else {
        status = 404;
        responseData = { success: false, message: '공고를 찾을 수 없습니다.' };
      }
    }
    else if (isMatch('/bid-notices/interest') && method === 'get') {
      const notices = getMockData('mock_notices') || [];
      const interestNotices = notices.filter(n => n.is_interest);
      responseData = { success: true, items: interestNotices };
    }
    else if (isMatch('/bid-notices/:id') && method === 'get') {
      const id = getUrlParam('/bid-notices/:id');
      const notice = getMockData('mock_notices').find(n => n.id === parseInt(id));
      if (notice) {
        responseData = notice;
      } else {
        responseData = { message: "Bid notice not found" };
      }
    }
    else if (isMatch('/bid-notices/:id/interest') && method === 'post') {
      const id = getUrlParam('/bid-notices/:id/interest');
      const notices = getMockData('mock_notices') || [];
      const idx = notices.findIndex(n => n.id === parseInt(id));
      if (idx !== -1) {
        notices[idx].is_interest = !notices[idx].is_interest;
        setMockData('mock_notices', notices);
        responseData = { success: true, is_interest: notices[idx].is_interest, message: notices[idx].is_interest ? '관심 공고로 등록되었습니다.' : '관심 공고 해제되었습니다.' };
      } else {
        status = 404;
        responseData = { success: false, message: '공고를 찾을 수 없습니다.' };
      }
    }

    // C. 신규 추가 메뉴: 사전규격 (/specifications)
    else if (isMatch('/specifications') && method === 'get') {
      const params = getQueryParams();
      let specs = getMockData('mock_specifications');
      if (params.query) {
        specs = specs.filter(s => s.title.includes(params.query) || s.org_name.includes(params.query));
      }
      responseData = { success: true, items: specs };
    }

    // D. 신규 추가 메뉴: 개찰결과 (/bid-results)
    else if (isMatch('/bid-results') && method === 'get') {
      const params = getQueryParams();
      let results = getMockData('mock_bid_results');
      if (params.query) {
        results = results.filter(r => r.title.includes(params.query) || r.winner_name.includes(params.query));
      }
      responseData = { success: true, items: results };
    }

    // E. 신규 추가 메뉴: 제안서 도우미 (/proposal/*)
    else if (isMatch('/proposal/generate') && method === 'post') {
      await new Promise(r => setTimeout(r, 1000));
      const { notice_id } = JSON.parse(config.data || '{}');
      const notice = getMockData('mock_notices').find(n => n.id === parseInt(notice_id));
      
      const checklist = [
        { id: 101, category: '서류', name: '나라장터 경쟁입찰참가등록증 사본', checked: false },
        { id: 102, category: '서류', name: `신용평가등급확인서 (추정가격 ${parseInt(notice?.estimated_price || 0).toLocaleString()}원 기준)`, checked: false },
        { id: 103, category: '서류', name: '법인 등기부등본 및 사업자등록증', checked: false },
        { id: 104, category: '기술', name: '기술제안서 정량적/정성적 평가본 (PDF 형태 제출)', checked: false },
        { id: 105, category: '면허', name: `${notice?.license_limits?.split(',').map(l => l.split(':')[1]).join(', ') || '요구면허'} 사본`, checked: false },
      ];

      const faqs = [
        { q: "입찰 보증금 납부는 어떻게 하나요?", a: "신용평가등급 만족 시 조달청 전자 지급 보증서 또는 보증서 납부 면제 신청서 제출로 대체할 수 있습니다." },
        { q: "공동 수급 협정은 필수로 구성해야 하나요?", a: `본 공고는 단독 입찰 및 공동수급(분담이행 가능)이 가능하며, 정보통신공사 면허가 누락된 경우 분담이행 체결을 통해 보완 가능합니다.` },
        { q: "제안서 평가 배점 비율은 어떻게 구성되어 있나요?", a: "기술평가 90% 및 가격평가 10% 비중으로 설계된 협상에 의한 계약입니다." }
      ];

      responseData = { success: true, checklist, faqs };
    }

    // F. 관심조건 관련 API (/match-rules/*)
    else if (isMatch('/match-rules') && method === 'get') {
      responseData = { success: true, items: getMockData('mock_rules') };
    }
    else if (isMatch('/match-rules') && method === 'post') {
      const payload = JSON.parse(config.data || '{}');
      const rules = getMockData('mock_rules');
      const newRule = {
        id: Date.now(),
        ...payload
      };
      rules.push(newRule);
      setMockData('mock_rules', rules);
      responseData = { success: true, message: '관심 조건이 등록되었습니다.' };
    }
    else if (isMatch('/match-rules/:id') && method === 'delete') {
      const id = getUrlParam('/match-rules/:id');
      const rules = getMockData('mock_rules').filter(r => r.id !== parseInt(id));
      setMockData('mock_rules', rules);
      responseData = { success: true, message: '관심 조건이 삭제되었습니다.' };
    }

    // G. 알림 관련 API (/notifications/*)
    else if (isMatch('/notifications') && method === 'get') {
      const notis = getMockData('mock_notifications');
      const unreadCount = notis.filter(n => !n.is_read).length;
      responseData = { success: true, items: notis, unreadCount };
    }
    else if (isMatch('/notifications/read-all') && method === 'put') {
      const notis = getMockData('mock_notifications').map(n => ({ ...n, is_read: true }));
      setMockData('mock_notifications', notis);
      responseData = { success: true };
    }

    // H. 어드민 관련 API (/admin/*)
    else if (isMatch('/admin/stats') && method === 'get') {
      const users = getMockData('mock_users');
      const notices = getMockData('mock_notices');
      responseData = {
        success: true,
        data: {
          total_users: users.length,
          total_rules: getMockData('mock_rules').length,
          total_notices: notices.length,
          total_matches: notices.length * 3
        }
      };
    }
    else if (isMatch('/admin/logs') && method === 'get') {
      responseData = {
        success: true,
        system_logs: getMockData('mock_admin_logs'),
        email_stats: { SUCCESS: 42, RETRY: 2, FAILED: 1 }
      };
    }
    else if (isMatch('/admin/companies') && method === 'get') {
      const users = getMockData('mock_users');
      const companies = users.filter(u => u.company_name && u.role !== 'ADMIN').map(u => ({
        user_id: u.id,
        name: u.name,
        email: u.email,
        company_name: u.company_name,
        business_registration_no: u.business_registration_no,
        role: u.role,
        verification_status: u.verification_status
      }));
      responseData = { success: true, companies };
    }
    else if (isMatch('/admin/users') && method === 'get') {
      responseData = { success: true, users: getMockData('mock_users') };
    }
    else if (isMatch('/scraper/run') && method === 'post') {
      await new Promise(r => setTimeout(r, 800));
      const logs = getMockData('mock_admin_logs');
      logs.unshift({
        id: Date.now(),
        type: 'success',
        title: '수동 공고 동기화 완료',
        message: `조달청 API 호출 결과 15건의 신규 공고가 동기화되었습니다. (실행 시각: ${new Date().toLocaleTimeString()})`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString()
      });
      setMockData('mock_admin_logs', logs);
      responseData = { success: true, message: '나라장터 API 동기화가 수동 기동되어 신규 공고 15건이 추가 수집되었습니다.' };
    }
    else if (isMatch('/admin/verify-company') && method === 'post') {
      const { user_id, status: newStatus } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === parseInt(user_id));
      if (idx !== -1) {
        users[idx].verification_status = newStatus;
        if (newStatus === 'APPROVED') {
          users[idx].role = 'COMPANY';
          users[idx].is_verified = 1;
        } else {
          users[idx].role = 'USER';
          users[idx].is_verified = 0;
        }
        setMockData('mock_users', users);
        responseData = { success: true, message: `기업 검증 서류가 ${newStatus === 'APPROVED' ? '승인' : '반려'}되었습니다.` };
      } else {
        responseData = { success: false, message: '유저를 찾을 수 없습니다.' };
      }
    }
    else if (isMatch('/admin/verification-queue') && method === 'get') {
      responseData = { success: true, items: getMockData('mock_verification_queue') };
    }
    else if (isMatch('/admin/verification-queue') && method === 'post') {
      const { queue_id, status: newStatus } = JSON.parse(config.data || '{}');
      const queue = getMockData('mock_verification_queue');
      const idx = queue.findIndex(q => q.id === parseInt(queue_id));
      if (idx !== -1) {
        queue[idx].status = newStatus;
        setMockData('mock_verification_queue', queue);
        responseData = { success: true, message: `자격요건 검수가 ${newStatus === 'APPROVED' ? '승인' : '반려'} 처리되었습니다.` };
      } else {
        responseData = { success: false, message: '검수 큐 대상을 찾을 수 없습니다.' };
      }
    }
    else if (isMatch('/admin/companies/:userId') && method === 'delete') {
      const id = getUrlParam('/admin/companies/:userId');
      const users = getMockData('mock_users').filter(u => u.id !== parseInt(id));
      setMockData('mock_users', users);
      responseData = { success: true, message: '기업 계정이 정상 삭제되었습니다.' };
    }
    else if (isMatch('/admin/users/:userId/role') && method === 'put') {
      const id = getUrlParam('/admin/users/:userId/role');
      const { role } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === parseInt(id));
      if (idx !== -1) {
        users[idx].role = role;
        setMockData('mock_users', users);
        responseData = { success: true, message: '권한이 변경되었습니다.' };
      }
    }
    else if (isMatch('/admin/users/:userId/status') && method === 'put') {
      const id = getUrlParam('/admin/users/:userId/status');
      const { status: uStatus } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      const idx = users.findIndex(u => u.id === parseInt(id));
      if (idx !== -1) {
        users[idx].status = uStatus;
        setMockData('mock_users', users);
        responseData = { success: true, message: '상태가 변경되었습니다.' };
      }
    }
    else if (isMatch('/admin/users/:userId') && method === 'delete') {
      const id = getUrlParam('/admin/users/:userId');
      const users = getMockData('mock_users').filter(u => u.id !== parseInt(id));
      setMockData('mock_users', users);
      responseData = { success: true, message: '회원 계정이 삭제되었습니다.' };
    }
    
    // Default 404
    else {
      console.warn("Unhandled Mock Endpoint: ", method, url);
      status = 404;
      responseData = { success: false, message: `목업 경로가 구현되지 않았습니다: ${method.toUpperCase()} ${url}` };
    }

    const response = {
      data: responseData,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: { 'content-type': 'application/json' },
      config,
    };
    const validateStatus = config.validateStatus || ((responseStatus) => responseStatus >= 200 && responseStatus < 300);
    if (!validateStatus(status)) {
      const error = new Error(responseData?.message || '요청 처리에 실패했습니다.');
      error.config = config;
      error.response = response;
      return Promise.reject(error);
    }

    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};

// Create an Axios instance with mock adapter
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  adapter: mockAdapter
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/signup')) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
