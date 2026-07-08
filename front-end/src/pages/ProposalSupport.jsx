import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Sparkles, FileText, CheckSquare, MessageSquare, Download, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

function ProposalSupport() {
  const [notices, setNotices] = useState([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [guideData, setGuideData] = useState(null);

  useEffect(() => {
    // 공고 목록 가져오기
    api.get('/bid-notices')
      .then(res => {
        if (res.data.success) {
          setNotices(res.data.items || []);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleGenerate = () => {
    if (!selectedNoticeId) {
      alert("분석할 입찰 공고를 선택해주세요.");
      return;
    }
    setLoading(true);
    setGuideData(null);
    api.post('/proposal/generate', { notice_id: selectedNoticeId })
      .then(res => {
        if (res.data.success) {
          setGuideData({
            checklist: res.data.checklist || [],
            faqs: res.data.faqs || []
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCheckToggle = (id) => {
    setGuideData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div className="welcome-section" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c026d3', marginBottom: '8px' }}>
            <Sparkles size={24} />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>AI 기반 입찰 서류 업무 자동화</span>
          </div>
          <h1 className="welcome-title">입찰제안서 작성 지원 도우미</h1>
          <p className="welcome-subtitle">특정 나라장터 입찰 공고의 제안요청서(RFP)를 AI가 정밀 분석하여, 필수 제출 서류 체크리스트 및 맞춤 가이드북을 자동 생성합니다.</p>
        </div>

        {/* Notice Selector Panel */}
        <div className="panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>분석 대상 공고 선택</label>
            <select 
              value={selectedNoticeId} 
              onChange={e => setSelectedNoticeId(e.target.value)}
              style={{ width: '100%', height: '48px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '15px', outline: 'none', backgroundColor: '#fff' }}
            >
              <option value="">-- 분석할 최근 공고를 선택하십시오 --</option>
              {notices.map(notice => (
                <option key={notice.id} value={notice.id}>
                  {notice.notice_org_name} - {notice.title} (₩{parseInt(notice.estimated_price || 0).toLocaleString()}원)
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ width: '100%', height: '48px', backgroundColor: '#c026d3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" /> RFP 제안요청서 텍스트 정밀 분석 중 (약 1초)...
              </>
            ) : (
              <>
                <Sparkles size={18} /> AI 제안서 가이드북 및 제출서류 점검표 생성
              </>
            )}
          </button>
        </div>

        {/* Dynamic AI Results */}
        {!guideData && !loading && (
          <div className="panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px dashed #cbd5e1', backgroundColor: 'transparent' }}>
            <AlertCircle size={32} color="#94a3b8" />
            <span style={{ color: '#64748b', fontSize: '14px' }}>상단에서 입찰 공고를 선택하고 AI 제안서 작성을 가동해 주세요.</span>
          </div>
        )}

        {guideData && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* Checklist Column */}
            <div className="panel" style={{ padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fdf4ff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c026d3' }}>
                <CheckSquare size={18} />
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>AI 제출서류 체크리스트</h2>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>제안요청서 원문을 기반으로 누락하기 쉬운 필수 증빙서류들을 정리하였습니다. 완료한 서류는 체크해 주세요.</p>
                {guideData.checklist.map(item => (
                  <label 
                    key={item.id} 
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: item.checked ? '#fcf6ff' : '#fff', transition: 'all 0.2s' }}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => handleCheckToggle(item.id)}
                      style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: item.category === '서류' ? '#fee2e2' : '#dcfce7', color: item.category === '서류' ? '#991b1b' : '#166534', marginBottom: '6px' }}>{item.category}</span>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: item.checked ? '#94a3b8' : '#0f172a', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Strategy & Template Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* RFP FAQ */}
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fdf4ff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c026d3' }}>
                  <MessageSquare size={18} />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>RFP 핵심 전략 FAQ</h2>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {guideData.faqs.map((faq, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#c026d3', fontSize: '14px', display: 'flex', gap: '4px' }}>
                        <span>Q.</span> <span>{faq.q}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#475569', paddingLeft: '18px' }}>
                        {faq.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#0f172a" />
                  <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>공통 입찰 제출용 문서 템플릿</h2>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>01. 사업수행계획서 초안 작성 템플릿.hwp</div>
                    <button onClick={() => alert("한글 템플릿 다운로드 시뮬레이션 완료.")} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}><Download size={14} /> 받기</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>02. 발표 제안서 표준 PPT 포맷 (16:9 슬라이드).pptx</div>
                    <button onClick={() => alert("PPT 템플릿 다운로드 시뮬레이션 완료.")} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}><Download size={14} /> 받기</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>03. 청렴계약 이행 서약서 사본.docx</div>
                    <button onClick={() => alert("계약 서약서 다운로드 시뮬레이션 완료.")} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}><Download size={14} /> 받기</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default ProposalSupport;
