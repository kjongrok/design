import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Badge from '../components/UI/Badge';
import { ArrowLeft, Heart, Share2, FileText, Calendar, Clock, AlarmClock, ExternalLink, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../utils/api';

function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchScore, matchKeywords } = location.state || {};
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  useEffect(() => {
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

  return (
    <Layout>
      <div style={{ backgroundColor: '#f8fafc', padding: '0 40px 40px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#64748b', padding: '24px 0', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
            <ArrowLeft size={16} style={{ marginRight: '4px' }} /> 뒤로가기
          </button>
          <span>|</span>
          <span>공고 현황</span>
          <span>&gt;</span>
          <span>{notice.biz_type || "일반 용역"}</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{notice.notice_no}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Title Card */}
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Badge variant={notice.status === 'OPEN' ? 'info' : 'warning'} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  {notice.status === 'OPEN' ? '진행중' : '마감'}
                </Badge>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', color: '#fff', padding: '0 16px', height: '40px', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
                    <Heart size={16} /> 관심 등록
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#64748b' }}>
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              
              <h1 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.4, marginBottom: '40px', color: '#0f172a' }}>
                {notice.title}
              </h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>공고/사업번호</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{notice.bid_notice_no ? `${notice.bid_notice_no}-${notice.bid_notice_ord}` : notice.notice_no}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>수요기관</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{notice.demand_org_name || notice.notice_org_name || '알 수 없음'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>계약방법</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{notice.notice_type || '제한경쟁 (협상에 의한 계약)'}</div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <FileText size={20} color="#0f172a" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>공고 요약 및 주요 키워드</h2>
              </div>
              
              <div style={{ backgroundColor: '#f1f5f9', padding: '24px', borderRadius: '12px', fontSize: '15px', lineHeight: 1.6, color: '#334155', marginBottom: '24px' }}>
                해당 공고는 {notice.demand_org_name || '국가기관'}에서 발주한 [{notice.title}] 사업입니다. 상세 입찰참가 자격 및 과업 지시서는 우측 하단 나라장터 원본 공고 링크를 통해 꼭 확인해 주시기 바랍니다.
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {matchKeywords && matchKeywords.length > 0 ? matchKeywords.map((tag, idx) => (
                  <span key={idx} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                    #{tag}
                  </span>
                )) : (notice.match_keywords ? notice.match_keywords.split(' ').map((tag, idx) => (
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

            {/* Detail Table */}
            <div className="panel" style={{ padding: '0' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700 }}>상세 공고 명세</h2>
              </div>
              <div className="table-wrapper">
                <table style={{ margin: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '200px', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>공고기관</td>
                      <td>{notice.notice_org_name || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>추정가격</td>
                      <td>{notice.estimated_price ? `₩ ${parseInt(notice.estimated_price).toLocaleString()} (VAT 포함/별도 확인요망)` : '미정'}</td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>입찰방식/유형</td>
                      <td>{notice.biz_type} / {notice.notice_type}</td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '14px', borderBottom: 'none' }}>담당 품목분류</td>
                      <td style={{ borderBottom: 'none' }}>{notice.product_name ? `${notice.product_name} (${notice.product_class_no})` : '분류되지 않음'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Budget & Date Card */}
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>배정 예산</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                  {notice.budget_amount ? `₩ ${parseInt(notice.budget_amount).toLocaleString()}` : (notice.estimated_price ? `₩ ${parseInt(notice.estimated_price).toLocaleString()}` : '금액 미정')}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                    <Calendar size={16} /> 게시 일시
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatKoreanDateTime(notice.posted_at || notice.registered_at || notice.last_synced_at) || '미정'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px' }}>
                    <Clock size={16} /> 마감 일시
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#ef4444' }}>{formatKoreanDateTime(notice.deadline_at) || '미정'}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#fef2f2', color: '#ef4444', height: '48px', borderRadius: '8px', fontWeight: 700, fontSize: '18px', marginBottom: '24px' }}>
                <AlarmClock size={20} /> {dday !== null ? `D - ${dday}` : '마감일 미정'}
              </div>
              
              {notice.detail_url && (
                <button onClick={() => window.open(notice.detail_url, '_blank')} style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                  <ExternalLink size={18} /> 나라장터 원본 공고 보기
                </button>
              )}
              <button onClick={() => navigate('/notices')} style={{ width: '100%', height: '48px', backgroundColor: 'var(--color-card-bg)', color: '#0f172a', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                목록으로 돌아가기
              </button>
            </div>

            {/* Match Analysis Card */}
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <TrendingUp size={18} color="#0f172a" />
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>우리 기업 매칭 분석</h2>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>적합도 점수</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6' }}>{matchScore || 'N/A'}</div>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ width: matchScore ? matchScore : '0%', height: '100%', backgroundColor: '#3b82f6' }}></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#22c55e" /> 사업 키워드 부분 일치
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#22c55e" /> 지역 제한 해당 없음 (전국)
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </Layout>
  );
}

export default NoticeDetail;
