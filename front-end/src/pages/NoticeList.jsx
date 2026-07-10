import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Badge from '../components/UI/Badge';
import { Download, ChevronDown, ChevronLeft, ChevronRight, Search, Filter, RotateCcw, Heart, Sparkles } from 'lucide-react';
import api from '../utils/api';

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  // 필터 상태
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBudget, setFilterBudget] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchMode, setSearchMode] = useState('general');
  const [sortOrder, setSortOrder] = useState('latest');
  const [periodDays, setPeriodDays] = useState('ALL');

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '미정';
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
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };


  const fetchNotices = (page = currentPage, overrides = {}) => {
    let params = new URLSearchParams();
    const activeSearchMode = overrides.searchMode || searchMode;
    const activeSortOrder = overrides.sort || sortOrder;
    const activePeriodDays = overrides.periodDays || periodDays;
    
    if (filterKeyword) params.append('keyword', filterKeyword);
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    if (filterRegion !== 'ALL') params.append('region', filterRegion);
    if (filterCategory !== 'ALL') params.append('bizType', filterCategory);
    params.append('searchMode', activeSearchMode);
    params.append('sort', activeSearchMode === 'ai' ? 'relevance' : activeSortOrder);
    if (activePeriodDays !== 'ALL') params.append('periodDays', activePeriodDays);
    
    // 예산 범위 파싱
    if (filterBudget === 'U_1') {
      params.append('maxBudget', '100000000'); // 1억 미만
    } else if (filterBudget === '1_5') {
      params.append('minBudget', '100000000');
      params.append('maxBudget', '500000000'); // 1억~5억
    } else if (filterBudget === '5_10') {
      params.append('minBudget', '500000000');
      params.append('maxBudget', '1000000000'); // 5억~10억
    } else if (filterBudget === 'O_10') {
      params.append('minBudget', '1000000000'); // 10억 이상
    }

    params.append('limit', itemsPerPage);
    params.append('offset', (page - 1) * itemsPerPage);

    api.get(`/bid-notices?${params.toString()}`)
      .then(res => {
        const data = res.data;
        if (data && data.items) {
          const mapped = data.items.map(item => ({
            id: item.id,
            match: "95%",
            name: item.title,
            num: item.bid_notice_no ? `제 ${item.bid_notice_no}-${item.bid_notice_ord}호` : item.notice_no,
            org: item.notice_org_name || item.demand_org_name || "알 수 없음",
            budget: item.estimated_price ? parseInt(item.estimated_price).toLocaleString() : '미정',
            posted: item.posted_at ? formatDateTime(item.posted_at) : (item.registered_at ? formatDateTime(item.registered_at) : (item.last_synced_at ? formatDateTime(item.last_synced_at) : '미정')),
            date: item.deadline_at ? formatDateTime(item.deadline_at) : '미정',
            dday: item.deadline_at ? `D-${Math.max(0, Math.ceil((new Date(typeof item.deadline_at === 'string' ? item.deadline_at.replace(/-/g, '/') : item.deadline_at) - new Date()) / (1000 * 60 * 60 * 24)))}` : '상시',
            highlightDate: false,
            status: item.status === 'OPEN' ? '진행중' : '마감',
            is_interest: item.is_interest
          }));
          setNotices(mapped);
          setTotalCount(data.total || 0);
        } else {
          setNotices([]);
          setTotalCount(0);
        }
      })
      .catch(err => console.error("공고 목록 조회 실패:", err));
  };

  const downloadCSV = () => {
    if (notices.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
    
    const headers = ['일치도', '공고명', '공고번호', '기관명', '게시일시', '마감일시', 'D-Day', '상태', '예산(원)'];
    const rows = notices.map(n => [
      n.match,
      `"${n.name.replace(/"/g, '""')}"`,
      n.num,
      `"${n.org}"`,
      `"${n.posted}"`,
      `"${n.date}"`,
      n.dday,
      n.status,
      `"${n.budget}"`
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `공고목록_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilterKeyword('');
    setFilterStatus('ALL');
    setFilterBudget('ALL');
    setFilterRegion('ALL');
    setFilterCategory('ALL');
    setSearchMode('general');
    setSortOrder('latest');
    setPeriodDays('ALL');
    setCurrentPage(1);
    
    let params = new URLSearchParams();
    params.append('limit', itemsPerPage);
    params.append('offset', 0);
    api.get(`/bid-notices?${params.toString()}`)
      .then(res => {
        const data = res.data;
        if (data && data.items) {
          const mapped = data.items.map(item => ({
            id: item.id,
            match: "95%",
            name: item.title,
            num: item.bid_notice_no ? `제 ${item.bid_notice_no}-${item.bid_notice_ord}호` : item.notice_no,
            org: item.notice_org_name || item.demand_org_name || "알 수 없음",
            budget: item.estimated_price ? parseInt(item.estimated_price).toLocaleString() : '미정',
            posted: item.posted_at ? formatDateTime(item.posted_at) : '미정',
            date: item.deadline_at ? formatDateTime(item.deadline_at) : '미정',
            dday: item.deadline_at ? `D-${Math.max(0, Math.ceil((new Date(typeof item.deadline_at === 'string' ? item.deadline_at.replace(/-/g, '/') : item.deadline_at) - new Date()) / (1000 * 60 * 60 * 24)))}` : '상시',
            highlightDate: false,
            status: item.status === 'OPEN' ? '진행중' : '마감',
            is_interest: item.is_interest
          }));
          setNotices(mapped);
          setTotalCount(data.total || 0);
        } else {
          setNotices([]);
          setTotalCount(0);
        }
      })
      .catch(err => console.error("공고 목록 초기화 실패:", err));
  };

  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage]); // 페이지 변경 시 조회

  const toggleInterest = async (event, notice) => {
    event.stopPropagation();
    try {
      const response = await api.post(`/bid-notices/${notice.id}/interest`);
      if (response.data?.success) {
        const isInterest = response.data.is_interest;
        setNotices(current => current.map(item =>
          item.id === notice.id ? { ...item, is_interest: isInterest } : item
        ));
        alert(isInterest ? '관심 공고에 등록되었습니다.' : '관심 공고에서 해제되었습니다.');
      }
    } catch (error) {
      console.error('관심 공고 처리 실패:', error);
      alert('관심 공고 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 className="welcome-title">공고 목록</h1>
            <p className="welcome-subtitle">전체 공고 현황을 실시간으로 확인하고 검색/필터링할 수 있습니다.</p>
          </div>
          <button 
            onClick={downloadCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', color: '#fff', padding: '0 20px', height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            <Download size={16} /> 엑셀 다운로드
          </button>
        </div>

        {/* Advanced Search & Filter UI */}
        <div style={{ padding: '24px', marginBottom: '24px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', boxShadow: 'var(--box-shadow)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Search Bar */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
              <input 
                type="text"
                placeholder="어떤 공고를 찾으시나요? (예: 소프트웨어 유지보수, CCTV 설치)"
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (currentPage === 1) fetchNotices(1);
                    else setCurrentPage(1);
                  }
                }}
                style={{ width: '100%', height: '48px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
            <button 
              onClick={() => {
                setSearchMode('general');
                if (currentPage === 1) fetchNotices(1, { searchMode: 'general' });
                else setCurrentPage(1);
              }}
              style={{ backgroundColor: searchMode === 'general' ? '#2563eb' : '#e2e8f0', color: searchMode === 'general' ? '#fff' : '#334155', padding: '0 26px', height: '48px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => {
                if (searchMode === 'general') e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = searchMode === 'general' ? '#2563eb' : '#e2e8f0';
              }}
            >
              검색
            </button>
            <button
            onClick={() => {
              setSearchMode('ai');
              setSortOrder('relevance');
              setCurrentPage(1);
              fetchNotices(1, { searchMode: 'ai', sort: 'relevance' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', background: searchMode === 'ai' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : '#f5f3ff', color: searchMode === 'ai' ? '#fff' : '#6d28d9', padding: '0 22px', height: '48px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', border: searchMode === 'ai' ? 'none' : '1px solid #ddd6fe', cursor: 'pointer', whiteSpace: 'nowrap' }}
            title="공고명, 품목, 업종, 키워드를 종합해 관련도순으로 검색합니다."
          >
            <Sparkles size={17} /> AI 검색
          </button>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <span style={{ width: '42px', color: '#334155', fontWeight: 700 }}>정렬</span>
              {[{ value: 'relevance', label: '관련도순' }, { value: 'latest', label: '최신순' }].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    const nextMode = option.value === 'relevance' ? 'ai' : 'general';
                    setSortOrder(option.value);
                    setSearchMode(nextMode);
                    setCurrentPage(1);
                    fetchNotices(1, { sort: option.value, searchMode: nextMode });
                  }}
                  style={{ padding: 0, border: 0, background: 'transparent', color: sortOrder === option.value ? '#10b981' : '#64748b', fontWeight: sortOrder === option.value ? 700 : 500, cursor: 'pointer' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <span style={{ width: '42px', color: '#334155', fontWeight: 700 }}>기간</span>
              {[
                { value: 'ALL', label: '전체' },
                { value: '1', label: '1일' },
                { value: '7', label: '1주' },
                { value: '30', label: '1개월' },
                { value: '90', label: '3개월' },
                { value: '180', label: '6개월' },
                { value: '365', label: '1년' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPeriodDays(option.value);
                    setCurrentPage(1);
                    fetchNotices(1, { periodDays: option.value });
                  }}
                  style={{ padding: 0, border: 0, background: 'transparent', color: periodDays === option.value ? '#10b981' : '#64748b', fontWeight: periodDays === option.value ? 700 : 500, cursor: 'pointer' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Advanced Filters */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#475569', marginRight: '8px' }}>
              <Filter size={16} /> 상세 조건
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                if (currentPage === 1) setTimeout(() => fetchNotices(1), 0);
                else setCurrentPage(1);
              }}
              style={{ flex: '1 1 140px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', height: '40px', backgroundColor: '#f8fafc', fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}>
              <option value="ALL">상태 (전체)</option>
              <option value="OPEN">진행중</option>
              <option value="CLOSED">마감</option>
            </select>

            <select 
              value={filterBudget} 
              onChange={(e) => {
                setFilterBudget(e.target.value);
                if (currentPage === 1) setTimeout(() => fetchNotices(1), 0);
                else setCurrentPage(1);
              }}
              style={{ flex: '1 1 160px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', height: '40px', backgroundColor: '#f8fafc', fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}>
              <option value="ALL">예산 (전체)</option>
              <option value="U_1">1억 미만</option>
              <option value="1_5">1억 ~ 5억</option>
              <option value="5_10">5억 ~ 10억</option>
              <option value="O_10">10억 이상</option>
            </select>

            <select 
              value={filterRegion} 
              onChange={(e) => {
                setFilterRegion(e.target.value);
                if (currentPage === 1) setTimeout(() => fetchNotices(1), 0);
                else setCurrentPage(1);
              }}
              style={{ flex: '1 1 160px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', height: '40px', backgroundColor: '#f8fafc', fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}>
              <option value="ALL">지역 (전국)</option>
              <option value="서울특별시">서울특별시</option>
              <option value="경기도">경기도</option>
              <option value="인천광역시">인천광역시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="세종특별자치시">세종특별자치시</option>
              <option value="제주특별자치도">제주특별자치도</option>
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => {
                setFilterCategory(e.target.value);
                if (currentPage === 1) setTimeout(() => fetchNotices(1), 0);
                else setCurrentPage(1);
              }}
              style={{ flex: '1 1 160px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', height: '40px', backgroundColor: '#f8fafc', fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}>
              <option value="ALL">분류 (전체)</option>
              <option value="SERVC">용역</option>
              <option value="THNG">물품</option>
              <option value="CNST">공사</option>
            </select>

            <div style={{ flexGrow: 1 }} />
            
            <button 
              onClick={resetFilters}
              style={{ display: 'flex', alignItems: 'center', height: '40px', padding: '0 16px', backgroundColor: 'var(--color-card-bg)', color: '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid var(--color-border)', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.color = '#334155'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#64748b'; }}
            >
              <RotateCcw size={14} style={{ marginRight: '6px' }} /> 초기화
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="panel" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>일치도</th>
                  <th style={{ width: '56px', textAlign: 'center' }}>관심</th>
                  <th>공고명</th>
                  <th>기관명</th>
                  <th>예산(원)</th>
                  <th style={{ textAlign: 'center' }}>게시일시</th>
                  <th style={{ textAlign: 'center' }}>마감일시</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n, i) => (
                  <tr key={n.id || i} onClick={() => navigate(`/notice/${n.id}`)} style={{ cursor: 'pointer' }} className="hover-row">
                    <td><Badge variant="info">{n.match}</Badge></td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(event) => toggleInterest(event, n)}
                        aria-label={n.is_interest ? '관심 공고 해제' : '관심 공고 등록'}
                        title={n.is_interest ? '관심 공고 해제' : '관심 공고 등록'}
                        style={{
                          width: '34px',
                          height: '34px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          color: n.is_interest ? '#ef4444' : '#94a3b8',
                          backgroundColor: n.is_interest ? '#fef2f2' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Heart size={19} fill={n.is_interest ? '#ef4444' : 'none'} strokeWidth={2} />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{n.name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{n.num}</div>
                    </td>
                    <td style={{ color: '#475569' }}>{n.org}</td>
                    <td style={{ color: '#475569' }}>{n.budget}</td>
                    <td style={{ textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                      {n.posted}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, color: n.highlightDate ? '#ef4444' : '#0f172a', marginBottom: '4px' }}>{n.date}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{n.dday}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }}></div>
                        {n.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>총 {totalCount}개 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} 표시</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-card-bg)', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'default' : 'pointer' }}><ChevronLeft size={16} /></button>
              
              {/* Pagination logic */}
              {(() => {
                const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
                const pages = [];
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: i === currentPage ? '1px solid #3b82f6' : '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: i === currentPage ? '#60a5fa' : '#fff', color: i === currentPage ? '#fff' : '#334155', fontWeight: i === currentPage ? 600 : 400, cursor: 'pointer' }}>{i}</button>
                  );
                }
                return pages;
              })()}

              <button 
                onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / itemsPerPage) || 1, currentPage + 1))}
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage) || totalCount === 0}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-card-bg)', color: (currentPage === Math.ceil(totalCount / itemsPerPage) || totalCount === 0) ? '#cbd5e1' : '#64748b', cursor: (currentPage === Math.ceil(totalCount / itemsPerPage) || totalCount === 0) ? 'default' : 'pointer' }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default NoticeList;
