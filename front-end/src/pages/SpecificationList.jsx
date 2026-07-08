import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Search, Calendar, Landmark, Coins, FileText, X, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import Badge from '../components/UI/Badge';

function SpecificationList() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(null);

  const fetchSpecs = () => {
    setLoading(true);
    api.get(`/specifications?query=${searchQuery}`)
      .then(res => {
        if (res.data.success) {
          setSpecs(res.data.items || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSpecs();
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="welcome-section" style={{ marginBottom: '24px' }}>
          <h1 className="welcome-title">사전규격 공개 현황</h1>
          <p className="welcome-subtitle">나라장터 정식 공고가 등록되기 전, 발주처가 선공개한 규격 명세서를 미리 확인하여 입찰을 미리 대비하세요.</p>
        </div>

        {/* Search Filter Panel */}
        <div className="panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="사업명 또는 발주기관 검색..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '48px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px 0 48px', fontSize: '15px' }}
              />
            </div>
            <button type="submit" style={{ width: '100px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>검색</button>
          </form>
        </div>

        {/* Specs List Table */}
        <div className="panel" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>
          ) : specs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={32} color="#94a3b8" />
              <span>검색어와 일치하는 사전규격 내역이 없습니다.</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>규격 번호</th>
                    <th>구분</th>
                    <th>사전규격 명 (사업명)</th>
                    <th>발주기관</th>
                    <th>배정 예산</th>
                    <th>의견제출 마감일</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map(spec => (
                    <tr 
                      key={spec.id} 
                      onClick={() => setSelectedSpec(spec)} 
                      style={{ cursor: 'pointer' }}
                      className="hoverable-row"
                    >
                      <td style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{spec.spec_no}</td>
                      <td>
                        <Badge variant="info" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>{spec.biz_type}</Badge>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{spec.title}</td>
                      <td>{spec.org_name}</td>
                      <td style={{ fontWeight: 600 }}>
                        {spec.estimated_price ? `₩ ${parseInt(spec.estimated_price).toLocaleString()}` : '미정'}
                      </td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>{spec.deadline_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Specification Detail Modal */}
        {selectedSpec && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ width: '600px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--box-shadow)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>사전규격 상세 정보</h3>
                <button onClick={() => setSelectedSpec(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>규격 번호</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{selectedSpec.spec_no}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>사업명</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px', lineHeight: 1.4 }}>{selectedSpec.title}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>공고기관</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Landmark size={14} />{selectedSpec.org_name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>배정 예산</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Coins size={14} />{selectedSpec.estimated_price ? `₩ ${parseInt(selectedSpec.estimated_price).toLocaleString()}` : '미정'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>공개 일시</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} />{selectedSpec.posted_at}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>의견제출 마감일</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} />{selectedSpec.deadline_at}</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>사업 개요 및 주요 규격 내용</span>
                  <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#475569', marginTop: '8px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap' }}>
                    {selectedSpec.summary}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button onClick={() => setSelectedSpec(null)} style={{ height: '40px', padding: '0 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>닫기</button>
                <button 
                  onClick={() => {
                    alert("사전규격 명세서 다운로드 시뮬레이션 완료.");
                  }} 
                  style={{ height: '40px', padding: '0 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <FileText size={16} /> 규격서 다운로드
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SpecificationList;
