import React, { useState, useContext } from 'react';
import { Building2, CheckCircle2, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const res = await api.get(`/auth/oauth/${provider}/login`);
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data.message || '소셜 로그인 초기화에 실패했습니다.');
        setSocialLoading(null);
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신할 수 없습니다.');
      setSocialLoading(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        
        // Return to the page they tried to visit, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('로그인에 실패했습니다. 서버 상태를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ display: 'flex', width: '1000px', minHeight: '600px', backgroundColor: 'var(--color-card-bg)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--box-shadow)' }}>
        
        {/* Left Side */}
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

        {/* Right Side */}
        <div style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>환영합니다</h2>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '40px' }}>서비스를 이용하려면 로그인해 주세요.</p>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
              {error}
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
                  placeholder="••••••••" 
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
              <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#3b82f6', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', padding: 0 }}>비밀번호 재설정</button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: 600, marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : '로그인'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#94a3b8' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            <span style={{ padding: '0 16px', fontSize: '14px' }}>또는</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', background: '#fff', cursor: socialLoading ? 'not-allowed' : 'pointer', opacity: socialLoading ? 0.7 : 1 }}
            >
              {socialLoading === 'google' ? <Loader2 size={20} className="animate-spin" /> : 'Google'}
            </button>
            <button 
              onClick={() => handleSocialLogin('kakao')}
              disabled={socialLoading !== null}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', border: '1px solid #fee500', borderRadius: '8px', background: '#fee500', cursor: socialLoading ? 'not-allowed' : 'pointer', opacity: socialLoading ? 0.7 : 1 }}
            >
              {socialLoading === 'kakao' ? <Loader2 size={20} className="animate-spin" /> : '카카오'}
            </button>
          </div>
            
            <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748b' }}>
              계정이 없으신가요? <button type="button" onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 700, textDecoration: 'none', cursor: 'pointer', padding: 0 }}>회원가입 신청</button>
            </div>
        </div>
        
      </div>
    </div>
  );
}

export default Login;
