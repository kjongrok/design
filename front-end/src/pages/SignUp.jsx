import React, { useState } from 'react';
import { Building2, User, Mail, Lock, Key, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/signup', { email, password, name });
      if (res.data.success) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
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
      
      <div style={{ width: '560px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--box-shadow)' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#0f172a', padding: '32px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>BidMatch</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Public Procurement Intelligence</div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>회원가입</h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>서비스 이용을 위해 정보를 입력해주세요.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp}>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이름</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px' }}>
                <User size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="실명을 입력하세요" 
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} 
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이메일 주소</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px' }}>
                <Mail size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@company.com" 
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>비밀번호</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px' }}>
                  <Lock size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8자 이상 입력" 
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} 
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>비밀번호 확인</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px' }}>
                  <Key size={18} color="#94a3b8" style={{ marginRight: '12px' }} />
                  <input 
                    type="password" 
                    required
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder="동일하게 입력" 
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: 600, marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : '가입 완료하기'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              이미 계정이 있으신가요? <button type="button" onClick={() => navigate('/login')} style={{ backgroundColor: 'transparent', color: '#0284c7', fontWeight: 700, border: 'none', cursor: 'pointer', padding: 0 }}>로그인 페이지로 이동</button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}

export default SignUp;
