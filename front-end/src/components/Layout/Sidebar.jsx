import React, { useContext, useState } from 'react';
import { Building2, LayoutDashboard, List, SlidersHorizontal, Bell, User, Settings, LogOut, Calendar, ChevronDown, ChevronUp, FileSpreadsheet, Trophy, FileJson, Sparkles, Heart, CircleHelp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isNoticeMenuOpen, setIsNoticeMenuOpen] = useState(true);
  const canUseCompanyFeatures = user?.role === 'COMPANY' || user?.role === 'ADMIN';

  const isActive = (path) => location.pathname === path;
  const isSubActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <Building2 size={24} color="#fff" />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{fontSize: '18px', fontWeight: 700, lineHeight: 1.2}}>BidMatch</span>
          <span style={{fontSize: '11px', color: '#94a3b8'}}>나라장터 공고 알림</span>
        </div>
      </div>
      
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
          <LayoutDashboard size={20} />
          <span>대시보드</span>
        </button>
        
        {/* 공고 정보 (서브메뉴 그룹) */}
        <div>
          <button 
            className={`nav-item ${isSubActive('/notices') || isSubActive('/specifications') || isSubActive('/results') || isSubActive('/notice') ? 'active-parent' : ''}`} 
            onClick={() => setIsNoticeMenuOpen(!isNoticeMenuOpen)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileSpreadsheet size={20} />
              <span>공고 정보</span>
            </div>
            {isNoticeMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isNoticeMenuOpen && (
            <div className="sidebar-submenu" style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', gap: '2px', marginTop: '2px' }}>
              <button 
                className={`nav-item sub-item ${isActive('/notices') || isSubActive('/notice/') ? 'active' : ''}`} 
                onClick={() => navigate('/notices')}
                style={{ fontSize: '13px', padding: '10px 16px' }}
              >
                <List size={16} />
                <span>입찰공고 목록</span>
              </button>
              <button 
                className={`nav-item sub-item ${isActive('/specifications') ? 'active' : ''}`} 
                onClick={() => navigate('/specifications')}
                style={{ fontSize: '13px', padding: '10px 16px' }}
              >
                <FileJson size={16} />
                <span>사전규격</span>
              </button>
              <button 
                className={`nav-item sub-item ${isActive('/results') ? 'active' : ''}`} 
                onClick={() => navigate('/results')}
                style={{ fontSize: '13px', padding: '10px 16px' }}
              >
                <Trophy size={16} />
                <span>개찰결과·낙찰정보</span>
              </button>
            </div>
          )}
        </div>

        {canUseCompanyFeatures && (
          <button className={`nav-item ${isActive('/proposal') ? 'active' : ''}`} onClick={() => navigate('/proposal')}>
            <Sparkles size={20} color="#c026d3" />
            <span style={{ fontWeight: isActive('/proposal') ? 700 : 500 }}>입찰제안서 지원</span>
          </button>
        )}

        <button className={`nav-item ${isActive('/interests') ? 'active' : ''}`} onClick={() => navigate('/interests')}>
          <Heart size={20} color="#ef4444" />
          <span>관심 공고함</span>
        </button>

        {canUseCompanyFeatures && (
          <button className={`nav-item ${isActive('/conditions') ? 'active' : ''}`} onClick={() => navigate('/conditions')}>
            <SlidersHorizontal size={20} />
            <span>관심 조건 관리</span>
          </button>
        )}
        
        {canUseCompanyFeatures && (
          <button className={`nav-item ${isActive('/calendar') ? 'active' : ''}`} onClick={() => navigate('/calendar')}>
            <Calendar size={20} />
            <span>전체 캘린더</span>
          </button>
        )}
        
        {canUseCompanyFeatures && (
          <button className={`nav-item ${isActive('/notifications') ? 'active' : ''}`} onClick={() => navigate('/notifications')}>
            <Bell size={20} />
            <span>알림 이력</span>
          </button>
        )}
        
        <button className={`nav-item ${isActive('/support') ? 'active' : ''}`} onClick={() => navigate('/support')}>
          <CircleHelp size={20} />
          <span>고객센터</span>
        </button>

        <button className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
          <User size={20} />
          <span>내 정보</span>
        </button>
        
        {user?.role === 'ADMIN' && (
          <button className={`nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={() => navigate('/admin')}>
            <Settings size={20} />
            <span>설정 (관리자)</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout}>
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
