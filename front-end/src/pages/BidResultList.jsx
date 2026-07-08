import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Search, Calendar, Landmark, Coins, Trophy, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import api from '../utils/api';
import Badge from '../components/UI/Badge';

function BidResultList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResults = () => {
    setLoading(true);
    api.get(`/bid-results?query=${searchQuery}`)
      .then(res => {
        if (res.data.success) {
          setResults(res.data.items || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="welcome-section" style={{ marginBottom: '24px' }}>
          <h1 className="welcome-title">개찰결과 · 낙찰정보</h1>
          <p className="welcome-subtitle">나라장터 입찰 마감 후 최종 개찰 결과 및 낙찰된 업체 정보, 낙찰율 통계를 조회하여 향후 투찰 전략 수립에 활용하십시오.</p>
        </div>

        {/* Analytics Highlights */}
        <div className="metric-cards" style={{ marginBottom: '24px' }}>
          <div className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="metric-icon" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}><Trophy size={20} /></div>
            <div className="metric-trend info">최근 30일 기준</div>
            <div className="metric-label">최종 개찰 완료</div>
            <div className="metric-value">148<span className="metric-unit">건</span></div>
          </div>
          <div className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}><Percent size={20} /></div>
            <div className="metric-trend info">평균 사정율 대비</div>
            <div className="metric-label">평균 낙찰율</div>
            <div className="metric-value">87.52<span className="metric-unit">%</span></div>
          </div>
          <div className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><TrendingUp size={20} /></div>
            <div className="metric-trend info">협상에 의한 계약 기준</div>
            <div className="metric-label">평균 경쟁률</div>
            <div className="metric-value">4.2<span className="metric-unit">: 1</span></div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="사업명 또는 낙찰업체명 검색..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '48px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px 0 48px', fontSize: '15px' }}
              />
            </div>
            <button type="submit" style={{ width: '100px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>검색</button>
          </form>
        </div>

        {/* Results List */}
        <div className="panel" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={32} color="#94a3b8" />
              <span>검색어와 일치하는 개찰결과 정보가 없습니다.</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>공고 번호</th>
                    <th>개찰 사업명</th>
                    <th>수요기관</th>
                    <th>낙찰예정자 (낙찰사)</th>
                    <th>예정가격 (예가)</th>
                    <th>낙찰금액 (투찰가)</th>
                    <th>투찰률</th>
                    <th>개찰 일시</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(res => (
                    <tr key={res.id} className="hoverable-row">
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{res.notice_no}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{res.title}</td>
                      <td>{res.org_name}</td>
                      <td style={{ fontWeight: 600, color: '#166534' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Trophy size={14} color="#eab308" /> {res.winner_name}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {res.estimated_price ? `₩ ${parseInt(res.estimated_price).toLocaleString()}` : '-'}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {res.winning_amount ? `₩ ${parseInt(res.winning_amount).toLocaleString()}` : '-'}
                      </td>
                      <td>
                        <Badge variant="info" style={{ backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 700 }}>{res.success_rate}%</Badge>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{res.opened_at}</td>
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

export default BidResultList;
