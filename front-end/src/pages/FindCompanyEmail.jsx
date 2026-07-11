import React, { useState } from 'react';
import { ArrowLeft, Building2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function FindCompanyEmail() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault(); setError(''); setResult('');
    try { const { data } = await api.post('/auth/find-company-email', { name, business_registration_no: businessNo }); setResult(data.email); }
    catch (err) { setError(err.response?.data?.message || '기업회원 정보를 확인해 주세요.'); }
  };
  const field={height:46,border:'1px solid #cbd5e1',borderRadius:8,padding:'0 13px',fontSize:14};
  return <div style={{minHeight:'100vh',background:'#f8fafc',display:'grid',placeItems:'center'}}><div style={{width:480,background:'#fff',padding:38,borderRadius:15,boxShadow:'0 12px 36px rgba(15,23,42,.1)'}}>
    <Building2 size={36} color="#2563eb"/><h1 style={{fontSize:24,margin:'16px 0 8px'}}>기업회원 이메일 찾기</h1><p style={{fontSize:14,color:'#64748b',marginBottom:26}}>가입 담당자 이름과 사업자등록번호를 입력해 주세요.</p>
    <form onSubmit={submit} style={{display:'grid',gap:16}}><label style={{fontSize:13,fontWeight:700}}>담당자 이름<input required value={name} onChange={e=>setName(e.target.value)} style={{...field,width:'100%',marginTop:7}} placeholder="회원가입 시 입력한 이름"/></label><label style={{fontSize:13,fontWeight:700}}>사업자등록번호<input required value={businessNo} onChange={e=>setBusinessNo(e.target.value)} style={{...field,width:'100%',marginTop:7}} placeholder="000-00-00000"/></label><button style={{height:47,borderRadius:8,background:'#0f172a',color:'#fff',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}><Search size={17}/>이메일 찾기</button></form>
    {error&&<div style={{marginTop:18,padding:13,borderRadius:8,background:'#fef2f2',color:'#b91c1c',fontSize:13}}>{error}</div>}{result&&<div style={{marginTop:18,padding:18,borderRadius:8,background:'#eff6ff',color:'#1e40af',textAlign:'center'}}><div style={{fontSize:13,marginBottom:7}}>가입 이메일</div><strong style={{fontSize:18}}>{result}</strong></div>}
    <button onClick={()=>navigate('/login')} style={{display:'flex',alignItems:'center',gap:5,margin:'24px auto 0',color:'#64748b'}}><ArrowLeft size={15}/>로그인으로 돌아가기</button>
  </div></div>;
}
