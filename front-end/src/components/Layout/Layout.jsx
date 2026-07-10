import React, { useContext, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsEmailUpdate = user?.email?.endsWith('@no-email.com');
  const canReceiveMatchNotifications = user?.role === 'COMPANY' || user?.role === 'ADMIN';

  useEffect(() => {
    if (canReceiveMatchNotifications) {
      api.get('/notifications?limit=1').then(res => {
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(err => console.error(err));
    }
  }, [canReceiveMatchNotifications]);

  let pageTitle = "대시보드";
  if (location.pathname === '/notices') pageTitle = "공고 목록";
  else if (location.pathname.startsWith('/notice/')) pageTitle = "공고 상세";
  else if (location.pathname === '/calendar') pageTitle = "전체 캘린더";
  else if (location.pathname === '/notifications') pageTitle = "알림 이력";
  else if (location.pathname === '/conditions') pageTitle = "관심 조건 관리";
  else if (location.pathname === '/admin') pageTitle = "관리자 설정";
  else if (location.pathname === '/profile') pageTitle = "내 정보";

  if (location.pathname === '/support') pageTitle = "고객센터";

  const handleUpdateEmail = async () => {
    if (!emailInput.includes('@')) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/me/email', { email: emailInput });
      if (res.data.success) {
        alert('이메일이 성공적으로 등록되었습니다!');
        // 새로 발급받은 토큰과 정보를 Context에 반영 (모달은 needsEmailUpdate 조건에 의해 자동 해제됨)
        login(res.data.token, { ...user, email: res.data.email });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || '이메일 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      {/* 강제 이메일 입력 모달 */}
      {needsEmailUpdate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>수신용 이메일 등록</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              공고 알림을 받을 <strong>실제 이메일 주소</strong>를 필수로 등록해 주세요.
            </p>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', marginBottom: '16px', outline: 'none' }}
            />
            <button 
              onClick={handleUpdateEmail}
              disabled={isSubmitting}
              style={{ width: '100%', height: '48px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? '등록 중...' : '이메일 등록 완료'}
            </button>
          </div>
        </div>
      )}

      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{pageTitle}</div>
          </div>
          <div className="topbar-right">
            {canReceiveMatchNotifications && (
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                <Bell size={20} color="#64748b" />
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
            )}
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.name || '회원'}님</span>
                <span className="user-role">
                  {user?.role === 'ADMIN' ? '관리자' : (user?.role === 'COMPANY' ? '기업회원' : '일반회원')}
                </span>
              </div>
            </div>
          </div>
        </header>
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
