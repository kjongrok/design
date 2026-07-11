import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Heart, Trash2, FileText } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/UI/Badge';

function InterestNotices() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchInterestNotices = () => {
    setLoading(true);
    api.get('/bid-notices/interest')
      .then(res => {
        if (res.data.success) {
          setNotices(res.data.items || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInterestNotices();
  }, []);

  const handleRemoveInterest = (e, item) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 차단
    if (!window.confirm("선택하신 공고를 관심 공고함에서 삭제하시겠습니까?")) return;
    api.post(item.item_type === 'SPECIFICATION' ? `/specifications/${item.id}/interest` : `/bid-notices/${item.id}/interest`)
      .then(res => {
        if (res.data.success) {
          alert("관심 공고에서 제외되었습니다.");
          fetchInterestNotices(); // 목록 갱신
        }
      })
      .catch(err => console.error(err));
  };
  const visibleItems = notices.filter(item => typeFilter === 'ALL' || item.item_type === typeFilter);

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div className="welcome-section" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
            <Heart size={24} fill="#ef4444" />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>스크랩 및 관심 정보 관리</span>
          </div>
          <h1 className="welcome-title">관심 공고함</h1>
          <p className="welcome-subtitle">관심 등록한 사전규격과 입찰공고를 한곳에서 확인하고 참여 준비로 연결합니다.</p>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:18}}>{[['ALL','전체'],['SPECIFICATION','사전규격'],['NOTICE','입찰공고']].map(([key,label])=><button key={key} onClick={()=>setTypeFilter(key)} style={{padding:'9px 16px',borderRadius:18,background:typeFilter===key?'#0f172a':'#fff',color:typeFilter===key?'#fff':'#475569',border:'1px solid #cbd5e1',fontWeight:700}}>{label}</button>)}</div>

        {/* Notices Table */}
        <div className="panel" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>
          ) : notices.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '1px dashed #cbd5e1', borderRadius: '12px', backgroundColor: 'transparent' }}>
              <Heart size={40} color="#94a3b8" />
              <div>
                <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px', color: '#334155' }}>보관된 관심 공고가 없습니다.</strong>
                <span style={{ fontSize: '13px', color: '#64748b' }}>입찰공고 목록 또는 상세 화면에서 우측 상단의 '관심 등록' 버튼을 클릭해 보세요.</span>
              </div>
              <button onClick={() => navigate('/notices')} style={{ height: '40px', padding: '0 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>입찰공고 보러가기</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>공고 번호</th>
                    <th>구분</th>
                    <th>입찰 공고명</th>
                    <th>수요기관</th>
                    <th>배정 예산</th>
                    <th>마감 기한</th>
                    <th style={{ textAlign: 'right' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map(notice => (
                    <tr 
                      key={notice.id} 
                      onClick={() => notice.item_type === 'SPECIFICATION' ? navigate(`/specifications/${notice.id}`) : navigate('/notice/' + notice.id)} 
                      style={{ cursor: 'pointer' }}
                      className="hoverable-row"
                    >
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{notice.notice_no || notice.spec_no}</td>
                      <td>
                        <Badge variant="info" style={{ backgroundColor: notice.item_type === 'SPECIFICATION' ? '#f3e8ff' : '#eff6ff', color: notice.item_type === 'SPECIFICATION' ? '#7e22ce' : '#2563eb' }}>{notice.item_type === 'SPECIFICATION' ? '사전규격' : '입찰공고'}</Badge>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{notice.title}</td>
                      <td>{notice.demand_org_name || notice.notice_org_name || notice.org_name}</td>
                      <td style={{ fontWeight: 600 }}>
                        {notice.estimated_price ? `₩ ${parseInt(notice.estimated_price).toLocaleString()}원` : '미정'}
                      </td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>
                        {notice.deadline_at ? new Date(notice.deadline_at).toLocaleDateString() : '미정'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={(e) => handleRemoveInterest(e, notice)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          title="관심 해제"
                        >
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                        {notice.item_type === 'NOTICE' && <button onClick={e=>{e.stopPropagation();navigate('/proposal',{state:{noticeId:notice.id}})}} title="제안 준비 시작" style={{marginLeft:8,color:'#2563eb'}}><FileText size={18}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default InterestNotices;
