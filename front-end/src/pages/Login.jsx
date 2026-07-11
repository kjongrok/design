import React, { useContext, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restrictedType, setRestrictedType] = useState('');
  const [restrictionDetails, setRestrictionDetails] = useState(null);

  const openSupport = (type = '') => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (email) params.set('email', email);
    navigate(`/support/public${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const showLoginFailure = (data = {}, status) => {
    const message = data.message || '로그인에 실패했습니다. 입력 정보를 다시 확인해 주세요.';
    const accountStatus = data.account_status;

    setError(message);
    setRestrictionDetails(status === 403 ? { reason: data.reason, date: data.restricted_at } : null);
    if (status === 403) {
      if (accountStatus === 'dormant' || message.includes('휴면')) {
        setRestrictedType('dormant');
      } else if (accountStatus === 'blocked' || message.includes('정지')) {
        setRestrictedType('blocked');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setRestrictedType('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        showLoginFailure(res.data, res.status);
      }
    } catch (err) {
      showLoginFailure(err.response?.data, err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ display: 'flex', width: '1000px', minHeight: '600px', backgroundColor: 'var(--color-card-bg)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--box-shadow)' }}>
        <div style={{ width: '450px', backgroundColor: '#0f172a', padding: '60px 40px', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ zIndex: 1, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <Building2 size={32} />
              <span style={{ fontSize: '24px', fontWeight: 700 }}>BidMatch</span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>맞춤형 공고 매칭 서비스</h2>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '60px', lineHeight: 1.4 }}>전략적 공고 대응을 위한 데이터 인사이트</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <CheckCircle2 size={24} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>실시간 공고 매칭</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>AI 기반 맞춤형 공고 필터링 서비스</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <CheckCircle2 size={24} color="#60a5fa" />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>통합 알림 시스템</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>카카오톡/이메일 즉시 알림 제공</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', zIndex: 1 }}>
            © 2026 BidMatch. All Rights Reserved.
          </div>
        </div>

        <div style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>환영합니다</h2>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '40px' }}>서비스를 이용하려면 로그인해 주세요.</p>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '14px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
              {restrictionDetails && <div style={{ padding: '10px 12px', borderRadius: 7, background: 'rgba(255,255,255,.55)', fontSize: 13, lineHeight: 1.55 }}>
                <div><strong>처리 사유:</strong> {restrictionDetails.reason}</div>
                <div><strong>처리 일자:</strong> {restrictionDetails.date}</div>
              </div>}
              {restrictedType && (
                <button
                  type="button"
                  onClick={() => openSupport(restrictedType)}
                  style={{ alignSelf: 'flex-start', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {restrictedType === 'dormant' ? '휴면 계정 복구 문의' : '고객센터 문의하기'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이메일 주소</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '48px' }}>
                <Mail size={20} color="#94a3b8" style={{ marginRight: '12px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@company.com"
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>비밀번호</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '48px' }}>
                <Lock size={20} color="#94a3b8" style={{ marginRight: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px' }} /> 로그인 상태 유지
              </label>
              <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', padding: 0 }}>비밀번호 재설정</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : '로그인'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
            로그인이 안 되시나요?{' '}
            <button type="button" onClick={() => openSupport()} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 800, cursor: 'pointer', padding: 0 }}>
              고객센터 문의
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
            계정이 없으신가요?{' '}
            <button type="button" onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              회원가입 신청
            </button>
          </div>
          <button type="button" onClick={() => navigate('/find-company-email')} style={{ margin: '16px auto 0', background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>기업회원 이메일을 잊으셨나요?</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
