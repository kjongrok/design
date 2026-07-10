import React from 'react';
import { Building2, UserRound, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SignUpChoice() {
  const navigate = useNavigate();

  const cardStyle = {
    flex: 1,
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '28px',
    backgroundColor: '#fff',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '220px',
    boxShadow: 'var(--box-shadow-sm)'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '840px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--box-shadow)' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '32px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>BidMatch</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>회원가입 유형 선택</div>
        </div>

        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>어떤 유형으로 가입하시겠어요?</h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>가입 목적에 맞는 유형을 선택하면 해당 신청 페이지로 이동합니다.</p>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button type="button" onClick={() => navigate('/signup/personal')} style={cardStyle}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserRound size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>일반 회원가입</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>공고 검색, 관심 공고, 알림 확인 등 기본 기능을 먼저 이용합니다.</p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>
                일반 회원으로 가입 <ArrowRight size={16} />
              </div>
            </button>

            <button type="button" onClick={() => navigate('/signup/company')} style={cardStyle}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>기업 회원가입</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>사업자번호 확인과 사업자등록증 검수 후 기업회원 승인을 신청합니다.</p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                기업 인증 신청 <ArrowRight size={16} />
              </div>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748b' }}>
            이미 계정이 있으신가요? <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 700, cursor: 'pointer', padding: 0 }}>로그인 페이지로 이동</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpChoice;
