import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout/Layout';
import Badge from '../components/UI/Badge';
import { FileText, Target, Clock, Send, MailCheck, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // 1. 매칭된 맞춤형 공고 가져오기
    api.get('/bid-notices/matched')
      .then(res => {
        const data = res.data;
        if (data && data.items && data.items.length > 0) {
          const mapped = data.items.map(item => ({
            id: item.id,
            match: `${Math.floor(item.match_score || 99)}%`,
            name: item.title,
            org: item.notice_org_name || item.demand_org_name || "알 수 없음",
            date: item.deadline_at ? (() => {
              let d = new Date(item.deadline_at);
              if (isNaN(d.getTime()) && typeof item.deadline_at === 'string') {
                d = new Date(item.deadline_at.replace(/-/g, '/').replace('T', ' '));
              }
              return isNaN(d.getTime()) ? null : d;
            })() : null,
            dateStr: item.deadline_at ? (() => {
              let d = new Date(item.deadline_at);
              if (isNaN(d.getTime()) && typeof item.deadline_at === 'string') {
                d = new Date(item.deadline_at.replace(/-/g, '/').replace('T', ' '));
              }
              if (isNaN(d.getTime())) return item.deadline_at;
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            })() : '미정',
            budget: item.estimated_price ? parseInt(item.estimated_price).toLocaleString() : '미정',
            keywords: item.matched_keywords ? item.matched_keywords.split(',') : []
          }));
          setAllNotices(mapped);
          
          // 상위 5개 최근 매칭 (목록용)
          setNotices(mapped.slice(0, 5));
        } else {
          setNotices([]);
          setAllNotices([]);
        }
      })
      .catch(err => console.error("맞춤형 공고 데이터를 가져오는데 실패했습니다.", err));

    // 2. 알림 목록 가져오기
    api.get('/notifications?limit=3')
      .then(res => {
        if (res.data.success) {
          setNotifications(res.data.items || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(err => console.error("알림 데이터를 가져오는데 실패했습니다.", err));
  }, []);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Upcoming events
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // 선택된 달의 공고만 필터링
  const upcomingEvents = allNotices
    .filter(n => n.date && n.date.getFullYear() === year && n.date.getMonth() === month)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const getDDay = (targetDate) => {
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'D-Day' : `D-${diff}`;
  };

  // Calculate dynamic stats for metrics
  const todayDateStr = today.toLocaleDateString();
  const closingTodayCount = allNotices.filter(n => n.date && n.date.toLocaleDateString() === todayDateStr).length;
  const activeCount = allNotices.filter(n => n.date && n.date >= today).length;
  const totalMatchCount = allNotices.length;
  const closingSoonCount = allNotices.filter(n => {
    if (!n.date) return false;
    const diffDays = Math.ceil((n.date - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div className="welcome-section">
          <h1 className="welcome-title">안녕하세요, {user?.name || '회원'}님!</h1>
          <p className="welcome-subtitle">오늘의 공고 알림 현황을 확인해보세요.</p>
        </div>

        <div className="metric-cards">
          <div className="metric-card">
            <div className="metric-icon"><FileText size={20} /></div>
            <div className="metric-trend info">오늘 확인 필수</div>
            <div className="metric-label">오늘 마감 공고</div>
            <div className="metric-value">{closingTodayCount}<span className="metric-unit">건</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{backgroundColor: '#fff7ed', color: '#ea580c'}}><Target size={20} /></div>
            <div className="metric-trend info">진행 중 공고: {activeCount}건</div>
            <div className="metric-label">전체 매칭 공고</div>
            <div className="metric-value">{totalMatchCount}<span className="metric-unit">건</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{backgroundColor: '#fefce8', color: '#ca8a04'}}><Clock size={20} /></div>
            <div className="metric-trend warning">3일 이내 마감</div>
            <div className="metric-label">마감 임박 공고</div>
            <div className="metric-value">{closingSoonCount}<span className="metric-unit">건</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{backgroundColor: '#eff6ff', color: '#2563eb'}}><MailCheck size={20} /></div>
            <div className="metric-trend danger">{unreadCount > 0 ? '새 알림이 있습니다' : '모두 확인 완료'}</div>
            <div className="metric-label">미확인 알림</div>
            <div className="metric-value">{unreadCount}<span className="metric-unit">건</span></div>
          </div>
        </div>

        <div className="main-grid">
          {/* Left Column */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">최근 매칭 공고</div>
                <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); navigate('/notices'); }}>전체 보기</a>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>일치도</th>
                      <th>공고명</th>
                      <th>기관명</th>
                      <th>마감일</th>
                      <th>예산(원)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((n, i) => (
                      <tr key={i} onClick={() => navigate('/notice/' + n.id, { state: { matchScore: n.match, matchKeywords: n.keywords } })} style={{ cursor: 'pointer' }} className="hoverable-row">
                        <td><Badge variant="info">{n.match}</Badge></td>
                        <td style={{fontWeight: 700}}>{n.name}</td>
                        <td style={{color: 'var(--color-text-sub)'}}>{n.org}</td>
                        <td style={{color: n.date && n.date < new Date() ? 'var(--color-danger)' : 'var(--color-text-main)', fontWeight: n.date && n.date < new Date() ? 600 : 400}}>{n.dateStr}</td>
                        <td>{n.budget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">최근 매칭 알림</div>
                <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>전체 보기</a>
              </div>
              <div className="noti-list">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div className="noti-item" key={i} onClick={() => n.bid_notice_id && navigate('/notice/' + n.bid_notice_id)} style={{ cursor: n.bid_notice_id ? 'pointer' : 'default' }}>
                    <div className="noti-item-left">
                      <div className="noti-icon"><MailCheck size={20} /></div>
                      <div className="noti-content">
                        <strong>{n.title}</strong>
                        <span style={{color: n.is_read ? '#94a3b8' : '#334155'}}>{n.message}</span>
                        <span style={{fontSize: '11px', marginTop: '4px'}}>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {!n.is_read && <Badge variant="danger">New</Badge>}
                  </div>
                )) : <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>최근 알림이 없습니다.</div>}
              </div>
              <button className="more-btn" onClick={() => navigate('/notifications')}>전체 알림 보기 <ChevronRight size={14} style={{display:'inline', verticalAlign:'middle'}} /></button>
            </div>
          </div>

          {/* Right Column (Calendar) */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">마감 공고 캘린더</div>
              <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); navigate('/calendar'); }}>전체 캘린더 보기</a>
            </div>
            <div className="calendar-container">
              <div className="calendar-header">
                <button onClick={handlePrevMonth} style={{background:'none', border:'none', cursor:'pointer'}}><ChevronLeft size={18} /></button>
                <span style={{fontWeight: 700}}>{year}년 {month + 1}월</span>
                <button onClick={handleNextMonth} style={{background:'none', border:'none', cursor:'pointer'}}><ChevronRight size={18} /></button>
              </div>
              <div className="calendar-grid">
                {['일','월','화','수','목','금','토'].map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                
                {/* Previous month padding */}
                {[...Array(firstDayOfMonth)].map((_, i) => {
                  const d = daysInPrevMonth - firstDayOfMonth + i + 1;
                  return <div key={`p${i}`} className="calendar-cell muted">{d}</div>;
                })}
                
                {/* Current month days */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const currentCellDate = new Date(year, month, day);
                  
                  // 해당 일자에 마감인 공고 찾기
                  const noticesOnThisDay = allNotices.filter(n => 
                    n.date && 
                    n.date.getFullYear() === year && 
                    n.date.getMonth() === month && 
                    n.date.getDate() === day
                  );
                  
                  let className = "calendar-cell";
                  if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    className += " active-blue"; // 오늘 표시
                  } else if (noticesOnThisDay.length > 0) {
                    // 마감일이 있으면 강조 표시
                    className += " active-orange";
                  }
                  
                  return (
                    <div key={day} className={className}>
                      {day}
                      {noticesOnThisDay.length > 0 && <div className="calendar-dot orange" />}
                    </div>
                  );
                })}
              </div>

              <div className="calendar-events">
                {upcomingEvents.length > 0 ? upcomingEvents.map((evt, idx) => (
                  <div className="event-item" key={idx} onClick={() => navigate('/notice/' + evt.id)} style={{cursor: 'pointer'}}>
                    <div className="event-date">
                      {String(evt.date.getMonth() + 1).padStart(2, '0')}.{String(evt.date.getDate()).padStart(2, '0')}<br/>
                      ({['일','월','화','수','목','금','토'][evt.date.getDay()]})
                    </div>
                    <div className="event-info">
                      <div className="event-title">{evt.name}</div>
                      <div className="event-org">{evt.org}</div>
                    </div>
                    <div className={`event-badge ${getDDay(evt.date) === 'D-Day' || parseInt(getDDay(evt.date).replace('D-','')) <= 3 ? 'danger' : 'warning'}`}>
                      {getDDay(evt.date)}
                    </div>
                  </div>
                )) : (
                  <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>예정된 마감 공고가 없습니다.</div>
                )}
              </div>
              
              <div style={{textAlign:'center', marginTop:'16px'}}>
                <button className="more-btn" onClick={() => navigate('/calendar')}>더 보기 <ChevronDown size={14} style={{display:'inline', verticalAlign:'middle'}} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          <div>© 2025 나라장터 공고 알림 서비스. All rights reserved.</div>
          <div className="footer-links">
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">고객센터</a>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default UserDashboard;
