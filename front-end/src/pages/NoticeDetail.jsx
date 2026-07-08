import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Badge from '../components/UI/Badge';
import { ArrowLeft, Heart, Share2, FileText, Calendar, Clock, AlarmClock, ExternalLink, TrendingUp, CheckCircle2, XCircle, Sparkles, Award, MapPin, Landmark, Coins, AlertCircle, Percent } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchScore: initialMatchScore, matchKeywords } = location.state || {};
  const { user } = useContext(AuthContext); // 로그인 유저 정보 실시간 연동
  
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'diagnosis', 'score', 'compare'

  const formatKoreanDateTime = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      if (typeof dateStr === 'string') {
        d = new Date(dateStr.replace(/-/g, '/').replace('T', ' '));
      }
      if (isNaN(d.getTime())) return dateStr;
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  };

  const handleFetchAiSummary = () => {
    setAiLoading(true);
    api.get(`/bid-notices/${id}/summary`, { timeout: 60000 })
      .then(res => {
        if (res.data.success) {
          setAiSummary(res.data.summary);
        } else {
          alert(res.data.message || "AI 요약에 실패했습니다.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("AI 요약 요청 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setAiLoading(false);
      });
  };

  const handleToggleInterest = () => {
    api.post(`/bid-notices/${id}/interest`)
      .then(res => {
        if (res.data.success) {
          setNotice(prev => ({ ...prev, is_interest: res.data.is_interest }));
          alert(res.data.message);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/bid-notices/${id}`)
      .then(res => {
        setNotice(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("상세 데이터 조회 실패:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <Layout><div style={{ padding: '40px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div></Layout>;
  }

  if (!notice || notice.message === "Bid notice not found") {
    return <Layout><div style={{ padding: '40px', textAlign: 'center' }}>존재하지 않거나 삭제된 공고입니다.</div></Layout>;
  }

  const dday = notice.deadline_at 
    ? Math.max(0, Math.ceil((new Date(notice.deadline_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // -------------------------------------------------------------
  // 3. 실시간 자격 대조 진단 로직 (유저 정보 연동)
  // -------------------------------------------------------------
  
  // 3-1. 지역 요건 비교
  const userArea = "서울특별시"; // 가상 유저 기본 지역
  const isAreaMatch = !notice.area_limits || 
                      notice.area_limits === '전국' || 
                      notice.area_limits.includes(userArea);
  
  // 3-2. 면허 요건 비교 (유저 면허는 user?.license_codes 에 쉼표 구분자로 들어있음)
  const userLicenseCodes = user?.license_codes ? user.license_codes.split(',').map(c => c.trim()) : [];
  let isLicenseMatch = true;
  let requiredLicenseName = '';
  
  if (notice.license_limits) {
    // 예: "1468:소프트웨어사업자(컴퓨터관련서비스업)"
    const requiredLimits = notice.license_limits.split(',').map(l => l.trim());
    isLicenseMatch = requiredLimits.some(req => {
      const code = req.split(':')[0];
      requiredLicenseName = req.split(':')[1] || code;
      return userLicenseCodes.includes(code);
    });
  }

  // 3-3. 실적 요건 비교
  // 유저의 실적 총합 계산
  const userTotalPerformance = user?.performances 
    ? user.performances.reduce((acc, p) => acc + (p.amount || 0), 0)
    : 0;
  const requiredPerformance = notice.limit_performance_amount || 0;
  const isPerformanceMatch = userTotalPerformance >= requiredPerformance;

  // 최종 자격 판정 결과
  const isQualified = isAreaMatch && isLicenseMatch && isPerformanceMatch;

  // 매칭 스코어 조정
  let calculatedScore = initialMatchScore ? parseInt(initialMatchScore) : 95;
  if (!isAreaMatch) calculatedScore -= 20;
  if (!isLicenseMatch) calculatedScore -= 30;
  if (!isPerformanceMatch) calculatedScore -= 15;
  calculatedScore = Math.max(calculatedScore, 40);

  return (
    <Layout>
      <div style={{ backgroundColor: '#f8fafc', padding: '0 40px 40px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#64748b', padding: '24px 0', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
            <ArrowLeft size={16} style={{ marginRight: '4px' }} /> 뒤로가기
          </button>
          <span>|</span>
          <span>공고 정보</span>
          <span>&gt;</span>
          <span>입찰공고 목록</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{notice.notice_no}</span>
        </div>

        {/* Title Panel */}
        <div className="panel" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge variant={notice.status === 'OPEN' ? 'info' : 'warning'} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontWeight: 700 }}>
                {notice.status === 'OPEN' ? '진행중' : '마감'}
              </Badge>
              <Badge variant="info" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
                {notice.biz_type || "일반 용역"}
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleToggleInterest} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: notice.is_interest ? '#fee2e2' : '#0f172a', 
                  color: notice.is_interest ? '#ef4444' : '#fff', 
                  padding: '0 16px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  border: notice.is_interest ? '1px solid #fca5a5' : 'none', 
                  cursor: 'pointer' 
                }}
              >
                <Heart size={16} fill={notice.is_interest ? '#ef4444' : 'none'} /> 
                {notice.is_interest ? '관심 등록 해제' : '관심 등록'}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#64748b', backgroundColor: '#fff', cursor: 'pointer' }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
          
          <h1 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.4, marginBottom: '24px', color: '#0f172a' }}>
            {notice.title}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #e2e8f0', paddingTop: '24px', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>공고번호</div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{notice.bid_notice_no ? `${notice.bid_notice_no}-${notice.bid_notice_ord}` : notice.notice_no}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>수요기관</div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{notice.demand_org_name || notice.notice_org_name || '알 수 없음'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>계약방법</div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{notice.notice_type || '제한경쟁 (협상에 의한 계약)'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>투찰 마감</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444' }}>{formatKoreanDateTime(notice.deadline_at)}</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={() => setActiveTab('info')} style={{ padding: '12px 20px', fontWeight: 700, color: activeTab === 'info' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'info' ? '3px solid #0f172a' : '3px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}>
            기본정보 & AI요약
          </button>
          <button onClick={() => setActiveTab('diagnosis')} style={{ padding: '12px 20px', fontWeight: 700, color: activeTab === 'diagnosis' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'diagnosis' ? '3px solid #0f172a' : '3px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            자격 자가진단 ⭐
            <Badge variant={isQualified ? 'success' : 'danger'} style={{ fontSize: '10px', padding: '2px 6px' }}>{isQualified ? '적격' : '부적격'}</Badge>
          </button>
          <button onClick={() => setActiveTab('score')} style={{ padding: '12px 20px', fontWeight: 700, color: activeTab === 'score' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'score' ? '3px solid #0f172a' : '3px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}>
            AI 매칭 분석
          </button>
          <button onClick={() => setActiveTab('compare')} style={{ padding: '12px 20px', fontWeight: 700, color: activeTab === 'compare' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'compare' ? '3px solid #0f172a' : '3px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}>
            유사 공고 비교
          </button>
        </div>

        {/* Tab Contents Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Left Column (Dynamic Tab content) */}
          <div>
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 3줄 요약 */}
                <div className="panel" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <FileText size={20} color="#0f172a" />
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>공고 요약 및 주요 키워드</h2>
                  </div>
                  
                  <div style={{ backgroundColor: '#f1f5f9', padding: '20px 24px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, color: '#334155', marginBottom: '24px' }}>
                    해당 공고는 {notice.demand_org_name || '국가기관'}에서 발주한 [{notice.title}] 사업입니다. 상세 입찰참가 자격 및 과업 지시서는 우측 하단 나라장터 원본 공고 링크를 통해 꼭 확인해 주시기 바랍니다.
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                    {matchKeywords && matchKeywords.length > 0 ? matchKeywords.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                        #{tag}
                      </span>
                    )) : (notice.matched_keywords ? notice.matched_keywords.split(',').map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                        #{tag}
                      </span>
                    )) : <span style={{fontSize: '13px', color: '#94a3b8'}}>추출된 키워드가 없습니다.</span>)}
                  </div>

                  {/* AI Summary Section */}
                  <div style={{ padding: '24px', backgroundColor: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiSummary ? '16px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c026d3', fontWeight: 700, fontSize: '15px' }}>
                        <Sparkles size={18} /> AI 입찰 핵심 분석
                      </div>
                      {!aiSummary && (
                        <button onClick={handleFetchAiSummary} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#c026d3', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
                          {aiLoading ? '분석 중...' : '핵심 3줄 요약 받기'}
                        </button>
                      )}
                    </div>
                    
                    {aiSummary && (
                      <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#4a044e', whiteSpace: 'pre-wrap' }}>
                        {aiSummary}
                      </div>
                    )}
                  </div>
                </div>

                {/* 상세 공고 명세 */}
                <div className="panel" style={{ padding: 0 }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 700 }}>상세 공고 명세</h2>
                  </div>
                  <div className="table-wrapper">
                    <table style={{ margin: 0 }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '200px', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>공고기관</td>
                          <td>{notice.notice_org_name || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>추정가격</td>
                          <td>{notice.estimated_price ? `₩ ${parseInt(notice.estimated_price).toLocaleString()} (VAT 포함/별도 확인요망)` : '미정'}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>입찰방식/유형</td>
                          <td>{notice.biz_type} / {notice.notice_type}</td>
                        </tr>
                        <tr>
                          <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: 'none' }}>담당 품목분류</td>
                          <td style={{ borderBottom: 'none' }}>{notice.product_name ? `${notice.product_name} (${notice.product_class_no})` : '컴퓨터 소프트웨어'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diagnosis' && (
              <div className="panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#1e3a8a' }}>
                  <Award size={20} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700 }}>당사 프로필 기반 입찰 적격 진단</h2>
                </div>

                <div style={{ padding: '20px', backgroundColor: isQualified ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isQualified ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isQualified ? (
                    <CheckCircle2 size={32} color="#22c55e" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: isQualified ? '#15803d' : '#b91c1c', margin: '0 0 4px 0' }}>
                      {isQualified ? '입찰 적격 판정' : '일부 조건 미충족 (참가 보류)'}
                    </h3>
                    <p style={{ fontSize: '13px', color: isQualified ? '#166534' : '#991b1b', margin: 0 }}>
                      {isQualified 
                        ? '현재 당사의 기업 정보 및 보유 면허, 실적이 본 공고의 최소 요건을 충족합니다.'
                        : '공고 참가 조건 중 당사가 충족하지 못한 제한 항목이 감지되었습니다. 아래 대조표를 확인하십시오.'
                      }
                    </p>
                  </div>
                </div>

                {/* 요건 대조표 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {/* 지역 제한 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} />지역 제한 조건</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>요구사항: {notice.area_limits || '전국'} (자사 소재지: {userArea})</div>
                    </div>
                    <Badge variant={isAreaMatch ? 'success' : 'danger'}>{isAreaMatch ? '충족' : '지역 불일치'}</Badge>
                  </div>

                  {/* 면허 제한 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={16} />필요 업종/면허 자격</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>요구사항: {requiredLicenseName || '제한 없음'} (자사 보유: {user?.license_names || '없음'})</div>
                    </div>
                    <Badge variant={isLicenseMatch ? 'success' : 'danger'}>{isLicenseMatch ? '충족' : '면허 누락'}</Badge>
                  </div>

                  {/* 실적 제한 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><Coins size={16} />최소 요구 실적 금액</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>요구사항: {requiredPerformance > 0 ? `₩ ${requiredPerformance.toLocaleString()}원 이상` : '실적 제한 없음'} (자사 누적: ₩ {userTotalPerformance.toLocaleString()}원)</div>
                    </div>
                    <Badge variant={isPerformanceMatch ? 'success' : 'danger'}>{isPerformanceMatch ? '충족' : '실적 부족'}</Badge>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e40af', fontSize: '12px', lineHeight: 1.6 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>면책 사항 및 법적 주의</strong>: AI 자가진단 서비스는 공고 원문 분석 기반의 참고 지표입니다. 실제 제안서 제출 시에는 입찰 참가 직전에 조달청 나라장터 원본 공고의 세부 조건 및 자사 면허 유효 상태를 최종 확인하시기 바랍니다.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'score' && (
              <div className="panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#1e40af' }}>
                  <TrendingUp size={20} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700 }}>AI 입찰 적합도 분석 리포트</h2>
                </div>

                <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '32px' }}>
                  {/* Score Chart */}
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '12px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{calculatedScore}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>매칭 점수</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>우리 기업 협업 강점 리포트</h3>
                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#475569', margin: 0 }}>
                      당사가 보유한 {user?.license_names || '면허'}와 주소지, 과거 수행한 [{user?.performances?.[0]?.title || '공공개발'}] 등의 실적 데이터 분석 결과, 본 사업과의 적합도가 매우 {calculatedScore >= 80 ? '우수' : '보통'}하게 도출되었습니다.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} /> 주요 강점 요인</h4>
                    <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>주사업장이 공고 지정 대상 지역(서울/전국)과 완벽히 일치하여 지역 가점을 확보할 수 있습니다.</li>
                      <li>당사가 보유한 업종 자격이 공고의 주 과업 범위(용역) 요구 자격과 직접 연계됩니다.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={16} /> 위험 또는 보완 필요 요인</h4>
                    <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {!isPerformanceMatch ? (
                        <li style={{ color: '#ef4444', fontWeight: 600 }}>요구 실적 금액 대비 당사의 등록된 누적 실적(₩{userTotalPerformance.toLocaleString()})이 일부 미달합니다. 실적 추가 등록을 검토해 주세요.</li>
                      ) : (
                        <li>단독 입찰 시 정성 평가 서류 작성이 중요하므로, 기술 제안서(FAQ 가이드 참조)의 사전 준비가 적극 권장됩니다.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="panel" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Landmark size={20} />
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>이전 유사 공고 낙찰 결과 분석</h2>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>최근 1년 이내 동일한 수요기관 및 유사 과업 유형으로 낙찰 완료된 과거 사례 2건의 정보입니다.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* 유사공고 1 */}
                    <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                      <span style={{ display: 'inline-block', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>2025년 사례</span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.4 }}>서울특별시 주요 시스템 클라우드 백업 인프라 고도화 용역</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                        <div>수요기관: 서울특별시</div>
                        <div>예산: ₩ 450,000,000</div>
                        <div style={{ color: '#166534', fontWeight: 700 }}>낙찰사: (주)씨앤에스정보기술 (투찰률 87.52%)</div>
                      </div>
                    </div>

                    {/* 유사공고 2 */}
                    <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                      <span style={{ display: 'inline-block', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>2025년 사례</span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.4 }}>2025년 서울특별시 스마트 행정정보시스템 유지관리 용역</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                        <div>수요기관: 서울특별시</div>
                        <div>예산: ₩ 520,000,000</div>
                        <div style={{ color: '#166534', fontWeight: 700 }}>낙찰사: (주)정보넷코리아 (투찰률 87.91%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Budget & Quick Actions) */}
          <div className="panel" style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>배정 예산</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                {notice.estimated_price ? `₩ ${parseInt(notice.estimated_price).toLocaleString()}원` : '금액 미정'}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <Calendar size={16} /> 게시 일시
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{formatKoreanDateTime(notice.registered_at || notice.posted_at) || '미정'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px' }}>
                  <Clock size={16} /> 마감 일시
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#ef4444' }}>{formatKoreanDateTime(notice.deadline_at) || '미정'}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#fef2f2', color: '#ef4444', height: '48px', borderRadius: '8px', fontWeight: 700, fontSize: '18px', marginBottom: '24px' }}>
              <AlarmClock size={20} /> {dday !== null ? `D - ${dday}` : '마감일 미정'}
            </div>
            
            {notice.detail_url && (
              <button onClick={() => window.open(notice.detail_url, '_blank')} style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', border: 'none', cursor: 'pointer' }}>
                <ExternalLink size={18} /> 나라장터 원본 공고 보기
              </button>
            )}
            
            <button 
              onClick={() => {
                navigate('/proposal', { state: { noticeId: notice.id } });
              }} 
              style={{ width: '100%', height: '48px', backgroundColor: '#fdf4ff', color: '#c026d3', border: '1px solid #f0abfc', borderRadius: '8px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}
            >
              <Sparkles size={16} /> AI 제안서 도우미 실행
            </button>

            <button onClick={() => navigate(-1)} style={{ width: '100%', height: '48px', backgroundColor: '#fff', color: '#0f172a', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              이전 화면으로
            </button>
          </div>
          
        </div>
        
      </div>
    </Layout>
  );
}

export default NoticeDetail;
