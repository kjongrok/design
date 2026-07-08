import React, { useContext, useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { User, Building, ShieldCheck, Edit3, Trash2, FileText, Plus, CheckCircle, Search, Upload, LogOut, Landmark, Calendar, Coins } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const COMMON_LICENSES = [
  { code: '1468', name: '소프트웨어사업자(컴퓨터관련서비스업)' },
  { code: '1426', name: '소프트웨어사업자(패키지소프트웨어개발·공급사업)' },
  { code: '6502', name: '정보통신공사업' },
  { code: '1196', name: '학술.연구용역' },
  { code: '0001', name: '건축공사업' },
  { code: '0002', name: '토목공사업' },
  { code: '4993', name: '전시, 행사대행업' },
  { code: '1169', name: '산업디자인전문회사' },
  { code: '3230', name: '광고대행업' },
  { code: '1260', name: '실내건축공사업' }
];

function MyInfo() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal'); 
  
  const [personalInfo, setPersonalInfo] = useState({ name: '', phone: '' });
  
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    business_registration_no: '',
    business_type: '',
    is_youth_company: 0,
    is_woman_company: 0,
    is_disabled_company: 0,
    licenses: [],
    is_verified: 0,
    verification_status: 'NONE',
    performances: []
  });

  // 실적 추가 입력 폼 상태
  const [newPerformance, setNewPerformance] = useState({
    title: '',
    client: '',
    amount: '',
    date: ''
  });

  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchLicense, setSearchLicense] = useState('');
  const [selectedLicenses, setSelectedLicenses] = useState([]);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      if (res.data.success) {
        const u = res.data.user;
        setPersonalInfo({ name: u.name || '', phone: u.phone || '' });
        
        let licenses = [];
        if (u.license_codes && u.license_names) {
          const codes = u.license_codes.split(',');
          const names = u.license_names.split(',');
          licenses = codes.map((c, i) => ({ code: c, name: names[i] || '' })).filter(l => l.code);
        }

        setCompanyInfo({
          company_name: u.company_name || '',
          business_registration_no: u.business_registration_no || '',
          business_type: u.business_type || '',
          is_youth_company: u.is_youth_company || 0,
          is_woman_company: u.is_woman_company || 0,
          is_disabled_company: u.is_disabled_company || 0,
          licenses: licenses,
          is_verified: u.is_verified || 0,
          verification_status: u.verification_status || 'NONE',
          performances: u.performances || []
        });
      }
    });
  }, [user]);

  const handleSavePersonal = async () => {
    try {
      const res = await api.put('/auth/me', { name: personalInfo.name });
      if (res.data.success) {
        alert('개인 정보가 성공적으로 업데이트되었습니다.');
        updateUser({ name: personalInfo.name });
      } else {
        alert('업데이트 실패: ' + res.data.message);
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    }
  };

  const handleSaveCompany = async () => {
    try {
      const res = await api.put('/auth/me/company', companyInfo);
      if (res.data.success) {
        alert('기업 정보 및 면허 실적이 갱신되었습니다.');
        updateUser(res.data.user);
      } else {
        alert('갱신 실패: ' + res.data.message);
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }
    try {
      const res = await api.put('/auth/me/password', { 
        old_password: passwordData.old_password, 
        new_password: passwordData.new_password 
      });
      if (res.data.success) {
        alert('비밀번호가 변경되었습니다.');
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        alert('변경 실패: ' + res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const verifyBusinessNumber = async () => {
    if (!companyInfo.business_registration_no) return alert('사업자등록번호를 입력해주세요.');
    try {
      const res = await api.post('/auth/verify-business', { business_registration_no: companyInfo.business_registration_no });
      if (res.data.success) {
        alert(res.data.message);
        setCompanyInfo(prev => ({ ...prev, is_verified: 1 }));
        updateUser({ is_verified: 1, role: 'COMPANY' });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || '검증 실패');
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;
    alert('파일이 선택되었습니다. 제출하기 버튼을 눌러주세요.');
  };

  const submitVerificationDoc = async () => {
    try {
      const res = await api.post('/auth/upload-verification-doc');
      if (res.data.success) {
        alert(res.data.message);
        setCompanyInfo(prev => ({ ...prev, verification_status: 'PENDING' }));
        updateUser({ verification_status: 'PENDING' });
      }
    } catch (err) {
      alert('서류 제출 실패');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 계정을 탈퇴하시겠습니까?\n내 정보, 맞춤 설정, 스크랩 등 모든 데이터가 영구히 삭제되며 복구할 수 없습니다.")) {
      try {
        const res = await api.delete('/auth/me');
        if (res.data.success) {
          alert('계정이 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.');
          logout();
          navigate('/login', { replace: true });
        } else {
          alert(res.data.message || '탈퇴 처리 중 오류가 발생했습니다.');
        }
      } catch (err) {
        console.error(err);
        alert('서버와 통신할 수 없습니다.');
      }
    }
  };

  const openLicenseModal = () => {
    setSelectedLicenses(companyInfo.licenses.map(l => l.code));
    setIsModalOpen(true);
  };

  const toggleLicenseSelection = (code) => {
    setSelectedLicenses(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const confirmLicenseSelection = () => {
    const newLicenses = selectedLicenses.map(code => {
      const found = COMMON_LICENSES.find(c => c.code === code);
      const existing = companyInfo.licenses.find(c => c.code === code);
      return existing ? existing : { code, name: found ? found.name : '알수없는 면허' };
    });
    setCompanyInfo(prev => ({ ...prev, licenses: newLicenses }));
    setIsModalOpen(false);
  };

  const removeLicense = (idx) => {
    setCompanyInfo(prev => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== idx)
    }));
  };

  const filteredLicenses = COMMON_LICENSES.filter(l => 
    l.name.includes(searchLicense) || l.code.includes(searchLicense)
  );

  // -------------------------------------------------------------
  // 실적 관리 핸들러
  // -------------------------------------------------------------
  const handleAddPerformance = (e) => {
    e.preventDefault();
    if (!newPerformance.title || !newPerformance.client || !newPerformance.amount || !newPerformance.date) {
      alert("모든 실적 정보를 정확하게 기입해주세요.");
      return;
    }
    const updatedPerformances = [
      ...companyInfo.performances,
      {
        id: Date.now(),
        title: newPerformance.title,
        client: newPerformance.client,
        amount: parseInt(newPerformance.amount),
        date: newPerformance.date
      }
    ];

    const nextCompanyInfo = {
      ...companyInfo,
      performances: updatedPerformances
    };

    setCompanyInfo(nextCompanyInfo);
    
    // DB 저장 API 실행
    api.put('/auth/me/company', nextCompanyInfo)
      .then(res => {
        if (res.data.success) {
          updateUser(res.data.user);
          alert("실적이 등록되었습니다. 공고의 자격진단 시 실적 합산 결과에 자동 연동됩니다.");
          setNewPerformance({ title: '', client: '', amount: '', date: '' });
        }
      });
  };

  const handleRemovePerformance = (perfId) => {
    if (!window.confirm("정말 이 실적을 삭제하시겠습니까?")) return;
    const updatedPerformances = companyInfo.performances.filter(p => p.id !== perfId);
    
    const nextCompanyInfo = {
      ...companyInfo,
      performances: updatedPerformances
    };

    setCompanyInfo(nextCompanyInfo);

    api.put('/auth/me/company', nextCompanyInfo)
      .then(res => {
        if (res.data.success) {
          updateUser(res.data.user);
          alert("실적이 삭제되었습니다.");
        }
      });
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <h1 className="welcome-title" style={{ marginBottom: '32px' }}>내 정보 관리</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
          
          {/* Sidebar Tab Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('personal')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'personal' ? '#dbeafe' : 'transparent', color: activeTab === 'personal' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><User size={18} /> 개인 정보 설정</button>
            <button onClick={() => setActiveTab('company')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'company' ? '#dbeafe' : 'transparent', color: activeTab === 'company' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><Building size={18} /> 기업 정보 및 인증</button>
            <button onClick={() => setActiveTab('performance')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'performance' ? '#dbeafe' : 'transparent', color: activeTab === 'performance' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><FileText size={18} /> 자사 실적 관리</button>
            <button onClick={() => setActiveTab('security')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'security' ? '#dbeafe' : 'transparent', color: activeTab === 'security' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><ShieldCheck size={18} /> 보안 및 비밀번호</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {activeTab === 'personal' && (
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>개인 정보 설정</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>시스템 알림 및 공고 관리 권한을 위한 개인 정보를 수정할 수 있습니다.</p>
                </div>
                <div style={{ padding: '32px 40px', display: 'flex', gap: '40px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이름</label>
                        <input type="text" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', color: '#0f172a' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>회원 구분</label>
                        <input type="text" value={user?.role === 'ADMIN' ? '관리자' : user?.role === 'COMPANY' ? '기업 회원' : '일반 회원'} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc' }} readOnly />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이메일 주소</label>
                      <input type="email" value={user?.email || ''} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc' }} readOnly />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>연락처</label>
                      <input type="text" placeholder="연락처를 입력하세요" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', color: '#0f172a' }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '24px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSavePersonal} style={{ height: '40px', padding: '0 24px', backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer' }}>저장하기</button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="panel" style={{ padding: 0, backgroundColor: '#f8fafc' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>기업 정보 및 인증</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>나라장터 입찰 시 가점 및 제한 사항에 영향을 주는 기업 상세 정보입니다.</p>
                </div>
                <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>상호명 (법인명)</label>
                      <input type="text" value={companyInfo.company_name} onChange={e => setCompanyInfo({...companyInfo, company_name: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: 'var(--color-card-bg)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>사업자등록번호</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={companyInfo.business_registration_no} onChange={e => setCompanyInfo({...companyInfo, business_registration_no: e.target.value})} style={{ flex: 1, height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: 'var(--color-card-bg)' }} />
                        {companyInfo.is_verified === 1 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: '1px solid #bbf7d0' }}>
                            <CheckCircle size={16} /> 인증 완료
                          </div>
                        ) : (
                          <button onClick={verifyBusinessNumber} style={{ height: '44px', padding: '0 16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            인증하기
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>업태 (서비스/제조 등)</label>
                      <input type="text" value={companyInfo.business_type} onChange={e => setCompanyInfo({...companyInfo, business_type: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: 'var(--color-card-bg)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                      <ShieldCheck size={18} /> 우대 정책 및 인증 현황
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>여성기업 인증</span>
                        <input type="checkbox" checked={companyInfo.is_woman_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_woman_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                      </label>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>장애인기업 인증</span>
                        <input type="checkbox" checked={companyInfo.is_disabled_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_disabled_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                      </label>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>창업기업 (7년 이내)</span>
                        <input type="checkbox" checked={companyInfo.is_youth_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_youth_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                        <FileText size={18} /> 보유 면허 (업종코드)
                      </div>
                      <button onClick={openLicenseModal} style={{ backgroundColor: 'transparent', color: '#3b82f6', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={14} /> 면허 추가
                      </button>
                    </div>
                    
                    {companyInfo.licenses.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'var(--color-card-bg)' }}>
                        등록된 면허가 없습니다.
                      </div>
                    )}
                    
                    {companyInfo.licenses.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {companyInfo.licenses.map((lic, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ backgroundColor: '#60a5fa', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{lic.code}</span>
                              <span style={{ fontSize: '14px', fontWeight: 500 }}>{lic.name}</span>
                            </div>
                            <button onClick={() => removeLicense(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Document Upload Section */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={18} color="#475569" /> 증빙 서류 제출
                      </div>
                      <div>
                        {companyInfo.verification_status === 'NONE' && <span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>미제출</span>}
                        {companyInfo.verification_status === 'PENDING' && <span style={{ padding: '4px 8px', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>심사 대기중</span>}
                        {companyInfo.verification_status === 'APPROVED' && <span style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>승인 완료</span>}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>여성기업확인서, 면허증 사본 등을 업로드하여 관리자의 승인을 받으세요.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="file" onChange={handleFileUpload} style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', backgroundColor: '#f8fafc' }} />
                      <button onClick={submitVerificationDoc} style={{ padding: '0 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>제출하기</button>
                    </div>
                  </div>

                </div>
                <div style={{ padding: '24px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveCompany} style={{ height: '40px', padding: '0 24px', backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer' }}>기업 정보 갱신</button>
                </div>
              </div>
            )}

            {/* 자사 실적 관리 탭 추가 */}
            {activeTab === 'performance' && (
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>자사 입찰수행 실적 관리</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>최근 3년 간 당사가 준공 완료한 사업 실적 내역입니다. 공고 입찰자격 요건 충족 판단의 핵심 지표가 됩니다.</p>
                </div>
                
                <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* 실적 등록 폼 */}
                  <form onSubmit={handleAddPerformance} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16}/> 신규 준공 실적 등록</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>계약명 (사업명)</label>
                        <input type="text" value={newPerformance.title} onChange={e => setNewPerformance({...newPerformance, title: e.target.value})} placeholder="예: 2025년 OOO시스템 구축 사업" style={{ width: '100%', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', fontSize: '13px', backgroundColor: '#fff' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>발주기관 (고객사)</label>
                        <input type="text" value={newPerformance.client} onChange={e => setNewPerformance({...newPerformance, client: e.target.value})} placeholder="예: 서울특별시 정보화기획과" style={{ width: '100%', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', fontSize: '13px', backgroundColor: '#fff' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>계약금액 (원 - 숫자만)</label>
                        <input type="number" value={newPerformance.amount} onChange={e => setNewPerformance({...newPerformance, amount: e.target.value})} placeholder="예: 150000000" style={{ width: '100%', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', fontSize: '13px', backgroundColor: '#fff' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>준공년월일</label>
                        <input type="date" value={newPerformance.date} onChange={e => setNewPerformance({...newPerformance, date: e.target.value})} style={{ width: '100%', height: '40px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px', fontSize: '13px', backgroundColor: '#fff' }} />
                      </div>
                    </div>

                    <button type="submit" style={{ height: '40px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                      <Plus size={16} /> 실적 리스트에 추가
                    </button>
                  </form>

                  {/* 실적 리스트 테이블 */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>보유 실적 목록 ({companyInfo.performances.length}건)</h3>
                    {companyInfo.performances.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                        등록된 준공 실적이 없습니다. 상단 폼에서 실적을 입력하여 추가하십시오.
                      </div>
                    ) : (
                      <div className="table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <table style={{ margin: 0 }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                              <th>계약명</th>
                              <th>발주처</th>
                              <th>계약금액</th>
                              <th>준공일자</th>
                              <th style={{ textAlign: 'right' }}>관리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {companyInfo.performances.map(perf => (
                              <tr key={perf.id}>
                                <td style={{ fontWeight: 700 }}>{perf.title}</td>
                                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Landmark size={14} color="#64748b" /> {perf.client}</span></td>
                                <td style={{ fontWeight: 600, color: '#1e3a8a' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Coins size={14} color="#64748b"/> ₩ {parseInt(perf.amount).toLocaleString()}원</span></td>
                                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} color="#64748b"/> {perf.date}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                  <button onClick={() => handleRemovePerformance(perf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="삭제"><Trash2 size={16} color="#ef4444" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>보안 및 비밀번호</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>계정을 안전하게 보호하기 위해 비밀번호를 주기적으로 변경해주세요.</p>
                </div>
                <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>기존 비밀번호</label>
                    <input type="password" value={passwordData.old_password} onChange={e => setPasswordData({...passwordData, old_password: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>새 비밀번호</label>
                    <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>새 비밀번호 확인</label>
                    <input type="password" value={passwordData.confirm_password} onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})} style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ padding: '24px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button onClick={handleSavePassword} style={{ height: '40px', padding: '0 24px', backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer' }}>비밀번호 변경</button>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                    <button onClick={handleDeleteAccount} style={{ height: '36px', padding: '0 16px', backgroundColor: 'var(--color-card-bg)', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>계정 탈퇴</button>
                    <button onClick={handleLogout} style={{ height: '36px', padding: '0 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><LogOut size={16} /> 로그아웃</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Checkbox List License Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ width: '480px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: '80vh', boxShadow: 'var(--box-shadow)' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>면허 및 업종 선택</h3>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="면허명 또는 코드 검색" 
                    value={searchLicense}
                    onChange={e => setSearchLicense(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px 0 36px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredLicenses.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>검색 결과가 없습니다.</div>
                ) : (
                  filteredLicenses.map(lic => (
                    <label key={lic.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedLicenses.includes(lic.code) ? '#f0f9ff' : '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLicenses.includes(lic.code)} 
                        onChange={() => toggleLicenseSelection(lic.code)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{lic.code}</span>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{lic.name}</span>
                    </label>
                  ))
                )}
              </div>

              <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>선택됨: {selectedLicenses.length}건</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ height: '40px', padding: '0 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>취소</button>
                  <button onClick={confirmLicenseSelection} style={{ height: '40px', padding: '0 20px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>완료</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default MyInfo;
