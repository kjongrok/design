import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const input = { width: '100%', height: 48, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 14px', fontSize: 15 };

export default function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password-request', { email });
      setDemoCode(data.verification_code); setStep(2);
    } catch (err) { setError(err.response?.data?.message || '인증번호 발송에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password-verify', { email, verification_code: code });
      setTemporaryPassword(data.temporary_password); setStep(3);
    } catch (err) { setError(err.response?.data?.message || '인증번호를 확인해 주세요.'); }
    finally { setLoading(false); }
  };

  return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'grid', placeItems: 'center', padding: 32 }}>
    <div style={{ width: 500, background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 12px 36px rgba(15,23,42,.1)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', marginBottom: 20 }}><ShieldCheck /></div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>비밀번호 재설정</h1>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{step === 1 ? '가입 이메일로 인증번호를 보내드립니다.' : step === 2 ? '이메일로 받은 인증번호를 입력해 주세요.' : '임시 비밀번호가 발급되었습니다.'}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>{[1,2,3].map(n => <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= step ? '#2563eb' : '#e2e8f0' }} />)}</div>
      {error && <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {step === 1 && <form onSubmit={sendCode}><label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>이메일</label><div style={{ position: 'relative' }}><Mail size={18} style={{ position:'absolute', left:14, top:15, color:'#94a3b8' }}/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@company.com" style={{...input,paddingLeft:42}} /></div><button disabled={loading} style={{ width:'100%',height:48,marginTop:20,borderRadius:8,background:'#0f172a',color:'#fff',fontWeight:700 }}>{loading?'발송 중...':'인증번호 받기'}</button></form>}
      {step === 2 && <form onSubmit={verify}><div style={{ padding:14,background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,color:'#1e40af',fontSize:13,marginBottom:18 }}><strong>발송된 인증번호: {demoCode}</strong></div><label style={{ display:'block',fontWeight:700,fontSize:13,marginBottom:8 }}>인증번호 6자리</label><input required maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="인증번호 입력" style={{...input,letterSpacing:6,textAlign:'center',fontWeight:800}}/><button disabled={loading} style={{width:'100%',height:48,marginTop:20,borderRadius:8,background:'#0f172a',color:'#fff',fontWeight:700}}>{loading?'확인 중...':'인증하고 임시 비밀번호 발급'}</button></form>}
      {step === 3 && <div><div style={{padding:20,borderRadius:10,background:'#f0fdf4',border:'1px solid #bbf7d0',textAlign:'center'}}><CheckCircle2 color="#16a34a"/><div style={{fontSize:13,color:'#166534',margin:'10px 0 8px'}}>임시 비밀번호</div><strong style={{fontSize:22,letterSpacing:1}}>{temporaryPassword}</strong><button onClick={()=>navigator.clipboard?.writeText(temporaryPassword)} style={{display:'inline-flex',marginLeft:10,color:'#2563eb'}} title="복사"><Copy size={17}/></button></div><p style={{fontSize:13,color:'#b45309',background:'#fffbeb',padding:12,borderRadius:8,marginTop:14}}>임시 비밀번호로 로그인한 뒤 내 정보에서 비밀번호를 변경해 주세요.</p><button onClick={()=>navigate('/login',{state:{email}})} style={{width:'100%',height:48,marginTop:18,borderRadius:8,background:'#0f172a',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><KeyRound size={18}/>로그인하러 가기</button></div>}
      <button onClick={()=>navigate('/login')} style={{display:'flex',alignItems:'center',gap:5,margin:'24px auto 0',color:'#64748b',fontSize:13}}><ArrowLeft size={15}/>로그인으로 돌아가기</button>
    </div>
  </div>;
}
