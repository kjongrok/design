import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { RefreshCcw, Users, Monitor, Mail, AlertCircle, AlertTriangle, Info, CheckCircle2, Check, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [stats, setStats] = useState({
    total_users: 0,
    total_rules: 0,
    total_notices: 0,
    total_matches: 0
  });
  const [logs, setLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ SUCCESS: 0, RETRY: 0, FAILED: 0 });
  const [syncing, setSyncing] = useState(false);

  const fetchStats = () => {
    api.get('/admin/stats').then(res => {
      if (res.data.success) {
        setStats(res.data.data);
      }
    }).catch(err => console.error(err));
  };

  const fetchLogs = () => {
    api.get('/admin/logs').then(res => {
      if (res.data.success) {
        setLogs(res.data.system_logs || []);
        setEmailStats(res.data.email_stats || { SUCCESS: 0, RETRY: 0, FAILED: 0 });
      }
    }).catch(err => console.error(err));
  };

  const fetchCompanies = () => {
    api.get('/admin/companies').then(res => {
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    }).catch(err => console.error(err));
  };

  const fetchUsers = () => {
    api.get('/admin/users').then(res => {
      if (res.data.success) {
        setUsers(res.data.users);
      }
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleManualSync = () => {
    if (syncing) return;
    setSyncing(true);
    api.post('/scraper/run')
      .then(res => {
        alert(res.data.message || "수동 동기화가 완료되었습니다.");
        fetchStats();
        fetchLogs();
      })
      .catch(err => {
        alert("수동 동기화 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setSyncing(false);
      });
  };

  const handleVerify = (userId, status) => {
    if (!window.confirm(`해당 기업의 서류를 ${status === 'APPROVED' ? '승인' : '반려'} 처리하시겠습니까?`)) return;
    api.post('/admin/verify-company', { user_id: userId, status })
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          fetchCompanies();
        } else {
          alert(res.data.message);
        }
      })
      .catch(err => {
        alert("처리 중 오류가 발생했습니다.");
        console.error(err);
      });
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("정말 이 계정을 삭제하시겠습니까? 이 계정과 연결된 모든 조건, 검색 이력, 기업 정보가 영구적으로 삭제됩니다.")) return;
    api.delete(`/admin/companies/${userId}`)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          fetchCompanies();
          fetchStats(); // 통계도 갱신
        } else {
          alert(res.data.message);
        }
      })
      .catch(err => {
        alert("계정 삭제 중 오류가 발생했습니다.");
        console.error(err);
      });
  };

  const handleUpdateUserRole = (userId, newRole) => {
    if (!window.confirm(`권한을 ${newRole}로 변경하시겠습니까?`)) return;
    api.put(`/admin/users/${userId}/role`, { role: newRole })
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          fetchUsers();
        } else {
          alert(res.data.message);
        }
      }).catch(err => {
        alert(err.response?.data?.message || "처리 중 오류가 발생했습니다.");
        console.error(err);
      });
  };

  const handleUpdateUserStatus = (userId, newStatus) => {
    if (!window.confirm(`상태를 ${newStatus === 'blocked' ? '정지' : '활성'} 처리하시겠습니까?`)) return;
    api.put(`/admin/users/${userId}/status`, { status: newStatus })
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          fetchUsers();
        } else {
          alert(res.data.message);
        }
      }).catch(err => {
        alert(err.response?.data?.message || "처리 중 오류가 발생했습니다.");
        console.error(err);
      });
  };

  const handleDeleteRegularUser = (userId) => {
    if (!window.confirm("정말 회원을 영구 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.")) return;
    api.delete(`/admin/users/${userId}`)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          fetchUsers();
          fetchStats();
        } else {
          alert(res.data.message);
        }
      }).catch(err => {
        alert(err.response?.data?.message || "처리 중 오류가 발생했습니다.");
        console.error(err);
      });
  };

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="welcome-title">관리자 대시보드</h1>
            <p className="welcome-subtitle">나라장터 공고 알림 서비스의 실시간 운영 현황을 확인하세요.</p>
          </div>
          <button onClick={handleManualSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: syncing ? '#64748b' : '#0f172a', color: '#fff', padding: '0 20px', height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: syncing ? 'not-allowed' : 'pointer', border: 'none' }}>
            <RefreshCcw size={16} className={syncing ? 'spin' : ''} /> {syncing ? '동기화 중...' : '수동 동기화 실행'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => setActiveTab('home')}
            style={{ padding: '12px 16px', fontWeight: 600, color: activeTab === 'home' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'home' ? '2px solid #0f172a' : '2px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}
          >
            대시보드 홈
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            style={{ padding: '12px 16px', fontWeight: 600, color: activeTab === 'companies' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'companies' ? '2px solid #0f172a' : '2px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}
          >
            기업 증빙 관리
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ padding: '12px 16px', fontWeight: 600, color: activeTab === 'users' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'users' ? '2px solid #0f172a' : '2px solid transparent', backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '15px' }}
          >
            회원 관리
          </button>
        </div>

        {activeTab === 'home' ? (
          <>
            <div className="metric-cards">
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#0f172a' }}><Users size={20} /></div>
                <div className="metric-trend info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>가입 완료</div>
                <div className="metric-label">총 사용자 수</div>
                <div className="metric-value">{stats.total_users.toLocaleString()}<span className="metric-unit">명</span></div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#ffedd5', color: '#0f172a' }}><Monitor size={20} /></div>
                <div className="metric-trend info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>활성화 상태</div>
                <div className="metric-label">설정된 조건 수</div>
                <div className="metric-value">{stats.total_rules.toLocaleString()}<span className="metric-unit">건</span></div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}><RefreshCcw size={20} /></div>
                <div className="metric-trend info"><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div> G2B</div>
                <div className="metric-label">수집된 공고 수</div>
                <div className="metric-value" style={{ marginBottom: '8px' }}>{stats.total_notices.toLocaleString()}<span className="metric-unit">건</span></div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>자동 동기화 실행 중</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><Mail size={20} /></div>
                <div className="metric-trend info">실시간 분석</div>
                <div className="metric-label">누적 매칭 건수</div>
                <div className="metric-value" style={{ marginBottom: '8px', borderBottom: '3px solid #3b82f6', paddingBottom: '4px' }}>
                  {stats.total_matches.toLocaleString()}<span className="metric-unit">건</span>
                </div>
              </div>
            </div>

            <div className="main-grid">
              {/* Left Column */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">시스템 로그 및 오류 현황</div>
                  <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); navigate('/admin/logs'); }}>전체 보기</a>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {logs.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>최근 기록된 로그가 없습니다.</div>
                  ) : (
                    logs.slice(0, 5).map(log => {
                      let Icon = Info;
                      let bgColor = '#f8fafc';
                      let borderColor = '#3b82f6';
                      let color = '#3b82f6';
                      
                      if (log.type === 'danger') {
                        Icon = AlertCircle;
                        bgColor = '#fef2f2';
                        borderColor = '#ef4444';
                        color = '#ef4444';
                      } else if (log.type === 'success') {
                        Icon = CheckCircle2;
                        bgColor = '#f0fdf4';
                        borderColor = '#22c55e';
                        color = '#22c55e';
                      } else if (log.type === 'warning') {
                        Icon = RefreshCcw;
                        bgColor = '#fff7ed';
                        borderColor = '#f97316';
                        color = '#f97316';
                      }

                      return (
                        <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '20px', backgroundColor: bgColor, borderLeft: `4px solid ${borderColor}`, borderRadius: '0 8px 8px 0' }}>
                          <Icon size={20} color={color} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '14px', color: color }}>{log.title}</strong>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>{log.date} {log.time}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                              {log.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}

                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Email Log Card */}
                <div style={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', padding: '32px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '32px' }}>이메일/알림 발송 현황</h2>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span>정상 발송</span>
                      <span style={{ fontWeight: 700 }}>{emailStats.SUCCESS.toLocaleString()}건</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(5, (emailStats.SUCCESS / (emailStats.SUCCESS+emailStats.RETRY+emailStats.FAILED+1))*100))}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span>발송 대기 / 재시도</span>
                      <span style={{ fontWeight: 700 }}>{emailStats.RETRY.toLocaleString()}건</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, (emailStats.RETRY / (emailStats.SUCCESS+emailStats.RETRY+emailStats.FAILED+1))*100))}%`, height: '100%', backgroundColor: '#f97316' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span>발송 실패 (오류)</span>
                      <span style={{ fontWeight: 700 }}>{emailStats.FAILED.toLocaleString()}건</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, (emailStats.FAILED / (emailStats.SUCCESS+emailStats.RETRY+emailStats.FAILED+1))*100))}%`, height: '100%', backgroundColor: '#ef4444' }}></div>
                    </div>
                  </div>
                </div>

                {/* Service Status Card */}
                <div className="panel" style={{ padding: '32px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '24px' }}>서비스 연결 상태</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                        Public API Gateway
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>ONLINE</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                        Database Cluster
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>STABLE</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></div>
                        Worker Node #04
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f97316' }}>HIGH LOAD</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </>
        ) : activeTab === 'companies' ? (
          <div className="panel">
             <div className="panel-header">
               <div className="panel-title">기업 증빙 서류 관리</div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>사용자가 제출한 사업자 증빙 서류를 확인하고 승인/반려를 처리합니다.</p>
             </div>
             <div style={{ padding: '24px', overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                     <th style={{ padding: '12px 16px' }}>회사명</th>
                     <th style={{ padding: '12px 16px' }}>사업자등록번호</th>
                     <th style={{ padding: '12px 16px' }}>담당자 정보</th>
                     <th style={{ padding: '12px 16px' }}>권한</th>
                     <th style={{ padding: '12px 16px' }}>증빙 상태</th>
                     <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리</th>
                   </tr>
                 </thead>
                 <tbody>
                   {companies.map(c => (
                     <tr key={c.user_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                       <td style={{ padding: '16px', fontWeight: 600 }}>{c.company_name || '-'}</td>
                       <td style={{ padding: '16px' }}>{c.business_registration_no || '-'}</td>
                       <td style={{ padding: '16px' }}>
                         {c.name} <br/>
                         <span style={{fontSize:'12px', color:'#64748b'}}>{c.email}</span>
                       </td>
                       <td style={{ padding: '16px' }}>
                         <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: c.role === 'COMPANY' ? '#dcfce7' : '#f1f5f9', color: c.role === 'COMPANY' ? '#166534' : '#475569', fontWeight: 600 }}>
                           {c.role}
                         </span>
                       </td>
                       <td style={{ padding: '16px' }}>
                         <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: c.verification_status === 'APPROVED' ? '#dcfce7' : c.verification_status === 'REJECTED' ? '#fee2e2' : c.verification_status === 'PENDING' ? '#fef08a' : '#f1f5f9', color: c.verification_status === 'APPROVED' ? '#166534' : c.verification_status === 'REJECTED' ? '#991b1b' : c.verification_status === 'PENDING' ? '#854d0e' : '#475569', fontWeight: 600 }}>
                           {c.verification_status || 'UNVERIFIED'}
                         </span>
                       </td>
                       <td style={{ padding: '16px', textAlign: 'right' }}>
                         {c.verification_status === 'PENDING' ? (
                           <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                             <button onClick={() => handleVerify(c.user_id, 'APPROVED')} style={{ padding: '6px 12px', backgroundColor: '#22c55e', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer' }}>
                               <Check size={14}/> 승인
                             </button>
                             <button onClick={() => handleVerify(c.user_id, 'REJECTED')} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer' }}>
                               <X size={14}/> 반려
                             </button>
                             <button onClick={() => handleDeleteUser(c.user_id)} style={{ padding: '6px 12px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', color: '#ef4444', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginLeft: '8px' }}>
                               삭제
                             </button>
                           </div>
                         ) : (
                           <span style={{ fontSize: '13px', color: '#64748b' }}>처리 완료</span>
                         )}
                       </td>
                     </tr>
                   ))}
                   {companies.length === 0 && (
                     <tr>
                       <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>가입된 기업 정보가 없습니다.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
            </div>
        ) : activeTab === 'users' ? (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">전체 회원 관리</div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>가입된 모든 회원의 목록을 조회하고 권한 및 상태를 관리합니다.</p>
              </div>
              <div style={{ padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      <th style={{ padding: '12px 16px' }}>가입일</th>
                      <th style={{ padding: '12px 16px' }}>가입 유형</th>
                      <th style={{ padding: '12px 16px' }}>회원 정보</th>
                      <th style={{ padding: '12px 16px' }}>권한</th>
                      <th style={{ padding: '12px 16px' }}>상태</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리 작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            {u.auth_provider ? u.auth_provider.toUpperCase() : 'EMAIL'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: u.role === 'ADMIN' ? '#fef08a' : u.role === 'COMPANY' ? '#dcfce7' : '#f1f5f9', color: u.role === 'ADMIN' ? '#854d0e' : u.role === 'COMPANY' ? '#166534' : '#475569', fontWeight: 600 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: u.status === 'active' ? '#dcfce7' : '#fee2e2', color: u.status === 'active' ? '#166534' : '#991b1b', fontWeight: 600 }}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {u.role === 'ADMIN' ? (
                              <button onClick={() => handleUpdateUserRole(u.id, 'USER')} style={{ padding: '6px 12px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', color: '#475569', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                관리자 해임
                              </button>
                            ) : (
                              <button onClick={() => handleUpdateUserRole(u.id, 'ADMIN')} style={{ padding: '6px 12px', backgroundColor: 'var(--color-card-bg)', border: '1px solid #eab308', color: '#ca8a04', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                관리자 임명
                              </button>
                            )}
                            
                            {u.status === 'active' ? (
                              <button onClick={() => handleUpdateUserStatus(u.id, 'blocked')} style={{ padding: '6px 12px', backgroundColor: 'var(--color-card-bg)', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                정지
                              </button>
                            ) : (
                              <button onClick={() => handleUpdateUserStatus(u.id, 'active')} style={{ padding: '6px 12px', backgroundColor: '#22c55e', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                활성
                              </button>
                            )}

                            <button onClick={() => handleDeleteRegularUser(u.id)} style={{ padding: '6px', backgroundColor: 'var(--color-card-bg)', border: 'none', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer' }} title="삭제">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>가입된 회원이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        ) : null}

      </div>
    </Layout>
  );
}

export default AdminDashboard;
