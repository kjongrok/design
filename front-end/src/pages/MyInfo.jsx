import React, { useContext, useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { User, Building, ShieldCheck, Edit3, Trash2, FileText, Plus, CheckCircle, Search, Upload, LogOut, Landmark, Calendar, Coins, AlertCircle, HelpCircle, MapPin } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const COMMON_LICENSES = [
  { code: '1468', name: 'Software business' },
  { code: '1426', name: 'Package software business' },
  { code: '6502', name: 'Information communication work' },
  { code: '1196', name: 'Academic research service' },
  { code: '0001', name: 'Construction work' },
  { code: '0002', name: 'Civil engineering work' },
  { code: '4993', name: 'Display and event agency' },
  { code: '1169', name: 'Industrial design service' },
  { code: '3230', name: 'Advertising agency' },
  { code: '1260', name: 'Interior construction work' }
];

const requiredMark = <span style={{ color: '#dc2626', fontWeight: 700 }}>(필수)</span>;
const optionalMark = <span style={{ color: '#64748b', fontWeight: 600 }}>(선택)</span>;

const formLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#475569',
  marginBottom: '8px'
};

const helpIconStyle = {
  width: '18px',
  height: '18px',
  borderRadius: '999px',
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

function MyInfo() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal'); 
  const canManagePerformances = user?.role === 'COMPANY' || user?.role === 'ADMIN';
  
  const [personalInfo, setPersonalInfo] = useState({ name: '', phone: '' });
  
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    business_registration_no: '',
    business_type: '',
    industry: '',
    address: '',
    detail_address: '',
    ceo_name: '',
    representative_phone: '',
    phone: '',
    is_small_business: '없음',
    has_preferred_policy: '없음',
    has_license: '없음',
    business_license_file_name: '',
    is_youth_company: 0,
    is_woman_company: 0,
    is_disabled_company: 0,
    licenses: [],
    is_verified: 0,
    verification_status: 'NONE',
    performances: []
  });

  // 실적 추가 입력 팝업 상태
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
  const isBusinessIdentityLocked = companyInfo.is_verified === 1 || ['PENDING', 'APPROVED'].includes(companyInfo.verification_status);

  const requestBusinessIdentityEdit = () => {
    if (!window.confirm('기존 인증 요청을 취소하고 다시 검토됩니다. 인증 정보를 수정하시겠습니까?')) return;
    setCompanyInfo(prev => ({
      ...prev,
      is_verified: 0,
      verification_status: 'NONE'
    }));
    updateUser({ is_verified: 0, verification_status: 'NONE' });
  };

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
          industry: u.industry || '',
          address: u.address || '',
          detail_address: u.detail_address || '',
          ceo_name: u.ceo_name || '',
          representative_phone: u.representative_phone || '',
          phone: u.company_phone || '',
          is_small_business: u.is_small_business ? '있음' : '없음',
          has_preferred_policy: (u.is_youth_company || u.is_woman_company || u.is_disabled_company) ? '있음' : '없음',
          has_license: licenses.length > 0 ? '있음' : '없음',
          business_license_file_name: u.business_license_file_name || '',
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
    if (!companyInfo.business_license_file_name) {
      return alert('사업자등록증을 먼저 업로드해 주세요.');
    }
    if (!companyInfo.company_name || !companyInfo.business_registration_no) {
      return alert('상호명과 사업자등록번호를 확인해 주세요.');
    }
    try {
      const res = await api.post('/auth/verify-business', {
        company_name: companyInfo.company_name,
        business_registration_no: companyInfo.business_registration_no,
        business_type: companyInfo.business_type
      });
      if (res.data.success) {
        alert(res.data.message);
        setCompanyInfo(prev => ({
          ...prev,
          is_verified: 1,
          verification_status: 'PENDING',
          business_type: prev.business_type || res.data.company?.business_type || '서비스',
          address: prev.address || res.data.company?.address || '',
          industry: prev.industry || res.data.company?.industry || '',
          ceo_name: prev.ceo_name || res.data.company?.ceo_name || '',
          representative_phone: prev.representative_phone || res.data.company?.representative_phone || '',
          phone: prev.phone || res.data.company?.phone || ''
        }));
        updateUser({ is_verified: 1, verification_status: 'PENDING' });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || '검증 실패');
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    setCompanyInfo(prev => ({
      ...prev,
      business_license_file_name: file.name,
      company_name: prev.company_name || '한빛시스템 주식회사',
      business_registration_no: prev.business_registration_no || '123-45-67890',
      is_verified: 0,
      verification_status: 'NONE'
    }));
    alert('사업자등록증에서 상호명과 사업자등록번호를 추출했습니다. 값이 맞는지 확인한 뒤 인증하기를 눌러주세요.');
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
    if (window.confirm("정말로 계정을 탈퇴하시겠습니까?\n모든 정보, 맞춤 설정, 스크랩 등 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.")) {
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

  const renderCompanyInput = (label, key, { required = false, optional = false, placeholder = '', help = '', readOnly = false } = {}) => (
    <div>
      <label style={formLabelStyle}>
        {label}
        {required && requiredMark}
        {optional && optionalMark}
        {help && (
          <span style={helpIconStyle} title={help}>
            <HelpCircle size={12} />
          </span>
        )}
      </label>
      <input
        type="text"
        value={companyInfo[key] || ''}
        readOnly={readOnly}
        onChange={e => setCompanyInfo({ ...companyInfo, [key]: e.target.value })}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '44px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '0 16px',
          fontSize: '14px',
          backgroundColor: readOnly ? '#f1f5f9' : 'var(--color-card-bg)'
        }}
      />
    </div>
  );

  const renderSegmentedChoice = (label, key, help) => (
    <div>
      <label style={formLabelStyle}>
        {label}
        {requiredMark}
        {help && (
          <span style={helpIconStyle} title={help}>
            <HelpCircle size={12} />
          </span>
        )}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
        {['없음', '있음'].map(option => (
          <button
            type="button"
            key={option}
            onClick={() => setCompanyInfo({ ...companyInfo, [key]: option })}
            style={{
              backgroundColor: companyInfo[key] === option ? '#0f172a' : '#fff',
              color: companyInfo[key] === option ? '#fff' : '#475569',
              fontSize: '14px',
              fontWeight: 700,
              borderRight: option === '없음' ? '1px solid var(--color-border)' : 'none'
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // 실적 관리 핸들러  // -------------------------------------------------------------
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
            {canManagePerformances && (
              <button onClick={() => setActiveTab('performance')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'performance' ? '#dbeafe' : 'transparent', color: activeTab === 'performance' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><FileText size={18} /> 자사 실적 관리</button>
            )}
            <button onClick={() => setActiveTab('security')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: activeTab === 'security' ? '#dbeafe' : 'transparent', color: activeTab === 'security' ? '#1e3a8a' : '#64748b', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', textAlign: 'left', cursor: 'pointer' }}><ShieldCheck size={18} /> 보안 및 비밀번호</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {activeTab === 'personal' && (
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>개인 정보 설정</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>시스템 알림 및 공고 관리 권한을 위한 개인 정보를 수정하실 수 있습니다.</p>
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
                  <p style={{ fontSize: '13px', color: '#64748b' }}>사업자번호 API 확인과 사업자등록증 관리자 검토를 거쳐 기업회원 권한을 신청합니다.</p>
                </div>
                <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', backgroundColor: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', borderRadius: '8px', fontSize: '13px', lineHeight: 1.55 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      기업 인증은 사업자등록번호 API 확인과 사업자등록증 검토를 거쳐 관리자 승인 후 완료됩니다.<br />
                      입력하신 상호명, 사업자등록번호, 업태명, 업종 정보가 사업자등록증과 일치해야 합니다.
                    </div>
                  </div>

                  {/* 1. 기업 회원 승격 핵심 인증 정보 카드 */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={18} color="#475569" /> 사업자등록증 제출 {requiredMark}
                        <span style={helpIconStyle} title="등록증을 업로드하면 AI가 상호명과 사업자등록번호를 추출합니다. 추출값이 틀리면 인증하기 전에 수정할 수 있습니다.">
                          <HelpCircle size={12} />
                        </span>
                      </div>
                      <div>
                        {companyInfo.verification_status === 'NONE' && <span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>미제출</span>}
                        {companyInfo.verification_status === 'PENDING' && <span style={{ padding: '4px 8px', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>관리자 승인 대기중</span>}
                        {companyInfo.verification_status === 'APPROVED' && <span style={{ padding: '4px 8px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>승인 완료</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                      <input type="file" accept="image/*" disabled={isBusinessIdentityLocked} onChange={handleFileUpload} style={{ flex: 1, padding: '8px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', backgroundColor: isBusinessIdentityLocked ? '#f1f5f9' : '#f8fafc' }} />
                      <span style={{ minWidth: '150px', fontSize: '13px', color: companyInfo.business_license_file_name ? '#166534' : '#64748b', fontWeight: 700 }}>
                        {companyInfo.business_license_file_name || '파일 미선택'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {renderCompanyInput('상호명', 'company_name', { required: true, placeholder: '예: 한빛시스템 주식회사', readOnly: isBusinessIdentityLocked })}
                      <div>
                        <label style={formLabelStyle}>사업자등록번호 {requiredMark}</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" value={companyInfo.business_registration_no} readOnly={isBusinessIdentityLocked} onChange={e => setCompanyInfo({...companyInfo, business_registration_no: e.target.value, is_verified: 0})} style={{ flex: 1, height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: isBusinessIdentityLocked ? '#f1f5f9' : 'var(--color-card-bg)' }} />
                          {companyInfo.is_verified === 1 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '8px', fontWeight: 700, fontSize: '13px', border: '1px solid #bbf7d0' }}>
                              <CheckCircle size={16} /> API 확인 완료
                            </div>
                          ) : (
                            <button onClick={verifyBusinessNumber} style={{ height: '44px', padding: '0 16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                              인증하기
                            </button>
                          )}
                        </div>
                        {isBusinessIdentityLocked && (
                          <button onClick={requestBusinessIdentityEdit} style={{ marginTop: '8px', backgroundColor: 'transparent', color: '#b45309', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                            인증 정보 수정
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. 상시 수정 가능한 일반 기업 정보 카드 */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <Building size={18} color="#475569" /> 일반 기업 정보
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {renderCompanyInput('업태명', 'business_type', { required: true, placeholder: '예: 서비스' })}
                      {renderCompanyInput('업종', 'industry', { required: true, placeholder: '예: 소프트웨어 개발 및 공급업' })}
                      {renderCompanyInput('기업주소', 'address', { optional: true, placeholder: '카카오 맵 API 주소 검색', help: '카카오 맵 API 주소 검색을 지원하고 상세주소는 수기로 입력합니다.' })}
                      {renderCompanyInput('상세주소', 'detail_address', { optional: true })}
                      {renderCompanyInput('대표자', 'ceo_name', { optional: true })}
                      {renderCompanyInput('대표번호', 'representative_phone', { optional: true })}
                      {renderCompanyInput('전화번호', 'phone', { optional: true })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {renderSegmentedChoice('중소기업 여부', 'is_small_business')}
                    {renderSegmentedChoice('우대기업 여부', 'has_preferred_policy', '관리자 검수 대상은 아니며 사용자가 직접 관리합니다.')}
                    {renderSegmentedChoice('보유 면허', 'has_license', '실제 입찰 가능 여부는 공고 전문과 제출 서류 기준으로 확인해야 합니다.')}
                  </div>

                  {companyInfo.has_preferred_policy === '있음' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                        <ShieldCheck size={18} /> 우대 정책 유형
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>여성기업</span>
                          <input type="checkbox" checked={companyInfo.is_woman_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_woman_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                        </label>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>장애인기업</span>
                          <input type="checkbox" checked={companyInfo.is_disabled_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_disabled_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                        </label>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>창업기업</span>
                          <input type="checkbox" checked={companyInfo.is_youth_company === 1} onChange={e => setCompanyInfo({...companyInfo, is_youth_company: e.target.checked ? 1 : 0})} style={{ width: '18px', height: '18px' }} />
                        </label>
                      </div>
                    </div>
                  )}

                  {companyInfo.has_license === '있음' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                          <FileText size={18} /> 보유 면허
                        </div>
                        <button onClick={openLicenseModal} style={{ backgroundColor: 'transparent', color: '#3b82f6', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  )}

                  <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', lineHeight: 1.55 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>우대기업 여부와 보유 면허 정보는 사용자가 직접 입력·관리하는 정보이며, 관리자 검수 대상이 아닙니다. 실제 입찰 가능 여부는 공고 전문과 제출 서류 기준으로 최종 확인해야 합니다.</div>
                  </div>


                </div>
                <div style={{ padding: '24px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveCompany} style={{ height: '40px', padding: '0 24px', backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer' }}>기업 정보 갱신</button>
                </div>
              </div>
            )}

            {/* 자사 실적 관리 탭 추가 */}
            {activeTab === 'performance' && canManagePerformances && (
              <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>자사 납품 실적 관리</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>최근 3년간 당사가 준공 완료한 사업 실적 내역입니다. 공고 입찰자격 요건 충족 판단의 핵심 지표가 됩니다.</p>
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
                                <td style={{ fontWeight: 600, color: '#1e3a8a' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Coins size={14} color="#64748b"/> {parseInt(perf.amount).toLocaleString()}원</span></td>
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
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>선택 {selectedLicenses.length}건</span>
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
