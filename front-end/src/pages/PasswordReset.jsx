import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const res = await api.post('/auth/reset-password-request', { email });
      if (res.data.success) {
        setMessage('입력하신 이메일로 임시 비밀번호가 발송되었습니다.');
        setEmail('');
      } else {
        setError(res.data.message || '요청 처리 중 문제가 발생했습니다.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('서버와 통신할 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', backgroundColor: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldCheck size={28} color="#fff" />
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>BidMatch</div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Public Procurement Intelligence</div>
      </div>

      <div style={{ width: '480px', backgroundColor: 'var(--color-card-bg)', borderRadius: '12px', padding: '40px', boxShadow: 'var(--box-shadow)', marginBottom: '32px' }}>
        
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>비밀번호 재설정</h2>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '32px' }}>
          가입하신 이메일 주소를 입력하시면 비밀번호를 재설정할 수 있는 링크를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit}>
          {message && <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>{message}</div>}
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>이메일 주소</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '48px' }}>
              <Mail size={20} color="#94a3b8" style={{ marginRight: '12px' }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@domain.com" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', height: '48px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>재설정 링크 발송 <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/login')} style={{ backgroundColor: 'transparent', border: 'none', color: '#0284c7', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <ChevronLeft size={16} /> 로그인으로 돌아가기
          </button>
        </div>
        
      </div>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        도움이 필요하신가요? <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>고객 지원 센터</a>
      </div>

    </div>
  );
}

export default PasswordReset;
