import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  HelpCircle,
  Key,
  Loader2,
  Lock,
  Mail,
  Upload,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const inputWrap = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '0 14px',
  height: '44px',
  backgroundColor: '#fff',
};

const inputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  fontSize: '14px',
  backgroundColor: 'transparent',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '8px',
};

const helpStyle = {
  width: '18px',
  height: '18px',
  borderRadius: '999px',
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function Required() {
  return <span style={{ color: '#dc2626', fontWeight: 700 }}>(필수)</span>;
}

function Optional() {
  return <span style={{ color: '#64748b', fontWeight: 600 }}>(선택)</span>;
}

function TextField({ label, value, onChange, placeholder, type = 'text', required, optional, icon, help, disabled = false }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <Required />}
        {optional && <Optional />}
        {help && (
          <span style={helpStyle} title={help}>
            <HelpCircle size={12} />
          </span>
        )}
      </label>
      <div style={inputWrap}>
        {icon && React.cloneElement(icon, { size: 18, color: '#94a3b8', style: { marginRight: '10px' } })}
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{ ...inputStyle, color: disabled ? '#64748b' : '#0f172a' }}
        />
      </div>
    </div>
  );
}

function SegmentedChoice({ label, value, onChange, required, help }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <Required />}
        {help && (
          <span style={helpStyle} title={help}>
            <HelpCircle size={12} />
          </span>
        )}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', height: '44px' }}>
        {['없음', '있음'].map(option => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            style={{
              backgroundColor: value === option ? '#0f172a' : '#fff',
              color: value === option ? '#fff' : '#475569',
              fontSize: '14px',
              fontWeight: 700,
              borderRight: option === '없음' ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ children, tone = 'warning' }) {
  const colors = {
    warning: ['#fff7ed', '#fed7aa', '#9a3412'],
    info: ['#eff6ff', '#bfdbfe', '#1e40af'],
  }[tone];

  return (
    <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', borderRadius: '8px', border: `1px solid ${colors[1]}`, backgroundColor: colors[0], color: colors[2], fontSize: '13px', lineHeight: 1.55 }}>
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div>{children}</div>
    </div>
  );
}

function SignUp({ signupType = 'PERSONAL' }) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    businessRegistrationNo: '',
    businessStatus: '',
    industry: '',
    address: '',
    ceoName: '',
    representativePhone: '',
    phone: '',
    isSmallBusiness: '없음',
    hasPreferredPolicy: '없음',
    preferredPolicyTypes: '',
    hasLicense: '없음',
    licenseSummary: '',
    businessLicenseFileName: '',
    businessVerified: false,
  });

  const updateCompany = (key, value) => {
    setCompanyForm(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailVerify = () => {
    if (!email) {
      setError('이메일을 입력하고 인증해주세요.');
      return;
    }
    setError('');
    setEmailVerified(true);
  };

  const handleBusinessLicenseUpload = (e) => {
    const fileName = e.target.files?.[0]?.name || '';
    setCompanyForm(prev => ({
      ...prev,
      businessLicenseFileName: fileName,
      companyName: prev.companyName || '한빛시스템 주식회사',
      businessRegistrationNo: prev.businessRegistrationNo || '123-45-67890',
      businessVerified: false,
    }));
  };

  const handleBusinessVerify = () => {
    if (!companyForm.companyName || !companyForm.businessRegistrationNo) {
      setError('상호명, 사업자등록번호, 업태명을 입력하고 인증해주세요.');
      return;
    }
    setError('');
    setCompanyForm(prev => ({
      ...prev,
      businessVerified: true,
      businessStatus: prev.businessStatus || 'service',
      industry: prev.industry || 'software development',
      address: prev.address || 'Pangyo-ro 242, Bundang-gu, Seongnam-si',
      ceoName: prev.ceoName || 'CEO Kim',
      representativePhone: prev.representativePhone || '031-123-4567',
      phone: prev.phone || '010-1234-5678',
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (signupType === 'COMPANY') {
      if (!companyForm.businessVerified) {
        setError('사업자등록번호 인증을 완료해주세요.');
        return;
      }

      if (!companyForm.businessLicenseFileName) {
        setError('사업자등록증 사진을 첨부해주세요.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password,
        name: signupType === 'COMPANY' ? (name || companyForm.ceoName || companyForm.companyName) : name,
        company_name: signupType === 'COMPANY' ? companyForm.companyName : undefined,
        business_registration_no: signupType === 'COMPANY' ? companyForm.businessRegistrationNo : undefined,
        signup_type: signupType,
        role: 'USER',
        business_verification_status: signupType === 'COMPANY' ? 'PENDING' : 'NONE',
        company: signupType === 'COMPANY' ? companyForm : null,
      };
      const res = await api.post('/auth/signup', payload);
      if (res.data.success) {
        alert(signupType === 'COMPANY'
          ? '회원가입과 기업 인증 신청이 완료되었습니다. 관리자 승인 전까지는 일반회원 권한으로 이용됩니다.'
          : '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: signupType === 'COMPANY' ? '960px' : '560px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--box-shadow)' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '32px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>BidMatch</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Public Procurement Intelligence</div>
        </div>

        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              {signupType === 'COMPANY' ? '기업 회원가입' : '일반 회원가입'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              {signupType === 'COMPANY'
                ? '기업 인증 신청에 필요한 정보를 입력해 주세요.'
                : '기본 계정 생성에 필요한 정보를 입력해 주세요.'}
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {signupType === 'COMPANY' && (
              <InfoBox>
                기업회원 가입은 사업자등록번호 확인 및 사업자등록증 검토 등 관리자 승인 절차를 거쳐 완료됩니다.
                <br />
                승인 전까지는 일반회원 권한으로 이용되며, 입력 정보와 사업자등록증 내용이 일치하지 않으면 승인이 반려될 수 있습니다.
              </InfoBox>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: signupType === 'COMPANY' ? '1fr 1fr' : '1fr', gap: '16px' }}>
              {signupType === 'PERSONAL' && (
                <TextField label="이름" required value={name} onChange={e => setName(e.target.value)} placeholder="이름을 입력하세요" icon={<User />} />
              )}
              <div>
                <label style={labelStyle}>이메일 인증 <Required /></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ ...inputWrap, flex: 1 }}>
                    <Mail size={18} color="#94a3b8" style={{ marginRight: '10px' }} />
                    <input type="email" required value={email} onChange={e => { setEmail(e.target.value); setEmailVerified(false); }} placeholder="example@company.com" style={inputStyle} />
                  </div>
                  <button type="button" onClick={handleEmailVerify} style={{ height: '44px', padding: '0 16px', borderRadius: '8px', backgroundColor: emailVerified ? '#f0fdf4' : '#0f172a', color: emailVerified ? '#166534' : '#fff', border: emailVerified ? '1px solid #bbf7d0' : 'none', fontWeight: 700 }}>
                    {emailVerified ? '인증 완료' : '인증하기'}
                  </button>
                </div>
              </div>
              <TextField label="비밀번호" required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상 입력" icon={<Lock />} />
              <TextField label="비밀번호 확인" required type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="동일하게 입력" icon={<Key />} />
            </div>

            {signupType === 'COMPANY' && (
              <>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>
                    <Building2 size={18} /> 기업 인증 정보
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>
                      사업자등록증 사진 <Required />
                      <span style={helpStyle} title="등록증을 업로드하면 AI가 상호명과 사업자등록번호를 추출합니다. 추출값이 다르면 인증하기 전에 수정할 수 있습니다.">
                        <HelpCircle size={12} />
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        required={signupType === 'COMPANY'}
                        onChange={handleBusinessLicenseUpload}
                        style={{ flex: 1, padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fff', fontSize: '13px' }}
                      />
                      <div style={{ minWidth: '150px', fontSize: '13px', color: companyForm.businessLicenseFileName ? '#166534' : '#64748b', fontWeight: 700 }}>
                        {companyForm.businessLicenseFileName || '파일 미선택'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField label="상호명" required value={companyForm.companyName} disabled={companyForm.businessVerified} onChange={e => { updateCompany('companyName', e.target.value); updateCompany('businessVerified', false); }} placeholder="예: 한빛시스템 주식회사" />
                    <div>
                      <label style={labelStyle}>사업자등록번호 <Required /></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ ...inputWrap, flex: 1 }}>
                          <input required value={companyForm.businessRegistrationNo} disabled={companyForm.businessVerified} onChange={e => { updateCompany('businessRegistrationNo', e.target.value); updateCompany('businessVerified', false); }} placeholder="000-00-00000" style={{ ...inputStyle, color: companyForm.businessVerified ? '#64748b' : '#0f172a' }} />
                        </div>
                        <button type="button" onClick={handleBusinessVerify} style={{ height: '44px', padding: '0 16px', borderRadius: '8px', backgroundColor: companyForm.businessVerified ? '#f0fdf4' : '#0f172a', color: companyForm.businessVerified ? '#166534' : '#fff', border: companyForm.businessVerified ? '1px solid #bbf7d0' : 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {companyForm.businessVerified && <CheckCircle size={15} />} {companyForm.businessVerified ? '확인 완료' : '인증하기'}
                        </button>
                      </div>
                    </div>
                    <TextField label="업태명" required value={companyForm.businessStatus} onChange={e => updateCompany('businessStatus', e.target.value)} placeholder="예: 서비스" />
                    <TextField label="업종" required value={companyForm.industry} onChange={e => updateCompany('industry', e.target.value)} placeholder="예: 소프트웨어 개발 및 공급업" />
                    <div>
                      <label style={labelStyle}>
                        기업주소
                        <Optional />
                        <span style={helpStyle} title="카카오 맵 API로 주소를 검색하고 상세주소를 수기로 입력합니다.">
                          <HelpCircle size={12} />
                        </span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ ...inputWrap, flex: 1 }}>
                          <input
                            value={companyForm.address}
                            onChange={e => updateCompany('address', e.target.value)}
                            placeholder="예) 경기도 성남시 분당구 판교역로 242"
                            style={inputStyle}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => alert('카카오 주소 검색 API 연동 예정입니다.')}
                          style={{ height: '44px', padding: '0 16px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontWeight: 700 }}
                        >
                          주소찾기
                        </button>
                      </div>
                    </div>
                    <TextField label="대표자" optional value={companyForm.ceoName} onChange={e => updateCompany('ceoName', e.target.value)} placeholder="대표자명" />
                    <TextField label="대표번호" optional value={companyForm.representativePhone} onChange={e => updateCompany('representativePhone', e.target.value)} placeholder="대표번호" />
                    <TextField label="전화번호" optional value={companyForm.phone} onChange={e => updateCompany('phone', e.target.value)} placeholder="담당자 연락처" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <SegmentedChoice label="중소기업 여부" required value={companyForm.isSmallBusiness} onChange={value => updateCompany('isSmallBusiness', value)} />
                  <SegmentedChoice label="우대기업 여부" required value={companyForm.hasPreferredPolicy} onChange={value => updateCompany('hasPreferredPolicy', value)} help="관리자 검수 대상은 아니며 사용자가 직접 관리합니다." />
                  <SegmentedChoice label="보유 면허" required value={companyForm.hasLicense} onChange={value => updateCompany('hasLicense', value)} help="실제 입찰 가능 여부는 공고 전문 기준으로 확인해야 합니다." />
                </div>

                {(companyForm.hasPreferredPolicy === '있음' || companyForm.hasLicense === '있음') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {companyForm.hasPreferredPolicy === '있음' && (
                      <TextField label="우대기업 유형" optional value={companyForm.preferredPolicyTypes} onChange={e => updateCompany('preferredPolicyTypes', e.target.value)} placeholder="청년기업, 여성기업, 장애인기업 등" />
                    )}
                    {companyForm.hasLicense === '있음' && (
                      <TextField label="보유 면허 요약" optional value={companyForm.licenseSummary} onChange={e => updateCompany('licenseSummary', e.target.value)} placeholder="소프트웨어사업자 등" />
                    )}
                  </div>
                )}

                <InfoBox tone="info">
                  우대기업 여부와 보유 면허 정보는 사용자가 직접 입력·관리하는 정보이며, 실제 입찰 가능 여부는 공고 전문과 제출 서류 기준으로 최종 확인해야 합니다.
                </InfoBox>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>
                <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} required />
                서비스 이용약관 동의 <Required />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>
                <input type="checkbox" checked={privacyAgreed} onChange={e => setPrivacyAgreed(e.target.checked)} required />
                개인정보 처리방침 동의 <Required />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : signupType === 'COMPANY' ? '가입 및 기업 인증 신청' : '가입 완료하기'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              다른 유형으로 가입하시겠어요? <button type="button" onClick={() => navigate('/signup')} style={{ backgroundColor: 'transparent', color: '#0284c7', fontWeight: 700, border: 'none', cursor: 'pointer', padding: 0 }}>회원가입 유형 선택</button>
              <span style={{ color: '#cbd5e1', padding: '0 10px' }}>|</span>
              <button type="button" onClick={() => navigate('/login')} style={{ backgroundColor: 'transparent', color: '#0284c7', fontWeight: 700, border: 'none', cursor: 'pointer', padding: 0 }}>로그인 페이지로 이동</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
