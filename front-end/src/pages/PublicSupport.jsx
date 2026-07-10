import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Building2, Headphones, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const fieldStyle = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '14px',
  backgroundColor: '#fff',
};

function PublicSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialType = params.get('type') === 'dormant'
    ? '휴면 계정 해제 문의'
    : params.get('type') === 'blocked'
      ? '계정 정지 문의'
      : '로그인 불가';

  const [form, setForm] = useState({
    name: '',
    accountEmail: params.get('email') || '',
    replyEmail: '',
    category: initialType,
    companyName: '',
    businessNo: '',
    content: '',
    privacyAgreed: false,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.privacyAgreed) {
      alert('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }
    alert('문의가 접수되었습니다. 입력한 회신 이메일로 처리 결과를 안내드리겠습니다.');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '760px', backgroundColor: '#fff', borderRadius: '14px', boxShadow: 'var(--box-shadow)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
              <Headphones size={24} /> 고객센터 문의
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>로그인 전에도 계정 문제를 문의할 수 있습니다.</div>
          </div>
          <button onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontWeight: 700 }}>
            <ArrowLeft size={16} /> 로그인으로
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', lineHeight: 1.55 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>정지 또는 휴면 상태의 계정은 로그인할 수 없습니다. 가입 이메일과 회신 이메일을 남겨주시면 담당자가 확인 후 안내합니다.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              이름 (필수)
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...fieldStyle, height: '42px', marginTop: '7px' }} />
            </label>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              가입 이메일 (필수)
              <input required type="email" value={form.accountEmail} onChange={e => setForm({ ...form, accountEmail: e.target.value })} style={{ ...fieldStyle, height: '42px', marginTop: '7px' }} />
            </label>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              회신 받을 이메일 (필수)
              <input required type="email" value={form.replyEmail} onChange={e => setForm({ ...form, replyEmail: e.target.value })} style={{ ...fieldStyle, height: '42px', marginTop: '7px' }} />
            </label>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              문의 유형 (필수)
              <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...fieldStyle, height: '42px', marginTop: '7px' }}>
                <option>로그인 불가</option>
                <option>계정 정지 문의</option>
                <option>휴면 계정 해제 문의</option>
                <option>비밀번호/이메일 문제</option>
                <option>기타</option>
              </select>
            </label>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              상호명 (선택)
              <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} style={{ ...fieldStyle, height: '42px', marginTop: '7px' }} />
            </label>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              사업자등록번호 (선택)
              <input value={form.businessNo} onChange={e => setForm({ ...form, businessNo: e.target.value })} placeholder="000-00-00000" style={{ ...fieldStyle, height: '42px', marginTop: '7px' }} />
            </label>
          </div>

          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            문의 내용 (필수)
            <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="로그인이 되지 않는 상황과 확인이 필요한 내용을 적어주세요." style={{ ...fieldStyle, minHeight: '120px', marginTop: '7px', padding: '12px', resize: 'vertical', lineHeight: 1.5 }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 700 }}>
            <input type="checkbox" checked={form.privacyAgreed} onChange={e => setForm({ ...form, privacyAgreed: e.target.checked })} />
            문의 처리를 위한 개인정보 수집 및 이용에 동의합니다. (필수)
          </label>

          <button type="submit" style={{ height: '46px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Send size={17} /> 문의 접수
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
            <Building2 size={14} /> BidMatch 계정 지원
          </div>
        </form>
      </div>
    </div>
  );
}

export default PublicSupport;
