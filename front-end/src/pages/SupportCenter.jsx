import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2, ChevronRight, Clock3, Headphones, MessageCircle, Plus, Search, Send, X } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { AuthContext } from '../contexts/AuthContext';

const seedInquiries = [
  { id: 'Q-2026-0712', category: '서비스 이용', title: '맞춤 공고 알림은 언제 발송되나요?', content: '관심 조건에 맞는 공고가 수집되면 언제 알림을 받을 수 있는지 궁금합니다.', status: 'ANSWERED', createdAt: '2026.07.08 14:32', answer: '공고 수집과 조건 매칭이 완료된 후 등록한 이메일과 알림함으로 안내됩니다.', answeredAt: '2026.07.08 16:10' },
  { id: 'Q-2026-0707', category: '기업 인증', title: '기업 증빙 서류 검토 기간을 확인하고 싶습니다.', content: '사업자등록증을 제출했습니다. 승인까지 얼마나 걸리는지 확인 부탁드립니다.', status: 'WAITING', createdAt: '2026.07.07 11:05', answer: '', answeredAt: '' },
  { id: 'Q-2026-0628', category: '공고 정보', title: '관심 공고의 마감 일정이 변경되었습니다.', content: '나라장터와 서비스에 표시된 마감 일정이 다른 것 같습니다.', status: 'ANSWERED', createdAt: '2026.06.28 09:18', answer: '공고 변경사항이 다음 수집 주기에 반영되었습니다. 현재는 변경된 일정으로 확인할 수 있습니다.', answeredAt: '2026.06.28 10:42' }
];

const quickQuestions = [
  '입찰서 작성 지원 서비스는 어디에 있나요?',
  '맞춤 공고 알림은 어떻게 설정하나요?',
  '기업 인증은 어떻게 신청하나요?'
];

const card = { background: '#fff', border: '1px solid #cbd5e1', borderRadius: '14px', boxShadow: 'var(--box-shadow-sm)' };
const field = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', fontFamily: 'inherit' };

function SupportCenter() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const [inquiries, setInquiries] = useState(seedInquiries);
  const [selectedId, setSelectedId] = useState(seedInquiries[0].id);
  const [search, setSearch] = useState('');
  const [writeOpen, setWriteOpen] = useState(false);
  const [form, setForm] = useState({ category: '서비스 이용', title: '', content: '' });
  const [answer, setAnswer] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([{ from: 'bot', text: '안녕하세요! BidMatch 고객센터입니다. 서비스 이용 중 궁금한 점을 물어보세요.' }]);

  const selected = inquiries.find(item => item.id === selectedId);
  const filtered = useMemo(() => inquiries.filter(item => item.title.includes(search) || item.category.includes(search)), [inquiries, search]);
  const waiting = inquiries.filter(item => item.status === 'WAITING').length;

  const sendChat = (value = chatInput) => {
    const text = value.trim();
    if (!text) return;
    let reply = { text: '정확한 안내가 필요한 내용입니다. 아래 문의 작성을 이용하면 담당자가 확인 후 답변드립니다.' };
    if (text.includes('입찰서') || text.includes('작성 지원') || text.includes('제안서')) reply = { text: '입찰서 작성 지원 서비스는 왼쪽 메뉴의 ‘입찰제안서 지원’에서 이용할 수 있습니다.', link: '/proposal', label: '입찰제안서 지원 바로가기' };
    else if (text.includes('알림') || text.includes('조건')) reply = { text: '‘관심 조건 관리’에서 키워드, 지역, 업종을 설정하면 맞춤 공고 알림을 받을 수 있습니다.', link: '/conditions', label: '관심 조건 관리 바로가기' };
    else if (text.includes('기업') || text.includes('인증')) reply = { text: '‘내 정보’에서 기업정보를 입력하고 증빙서류를 제출해 주세요.', link: '/profile', label: '기업 인증 신청 바로가기' };
    setMessages(prev => [...prev, { from: 'user', text }, { from: 'bot', ...reply }]);
    setChatInput('');
  };

  const addInquiry = () => {
    if (!form.title.trim() || !form.content.trim()) return alert('문의 제목과 내용을 입력해 주세요.');
    const item = { id: `Q-2026-${720 + inquiries.length}`, ...form, status: 'WAITING', createdAt: '2026.07.09 10:30', answer: '', answeredAt: '' };
    setInquiries(prev => [item, ...prev]);
    setSelectedId(item.id);
    setWriteOpen(false);
    setForm({ category: '서비스 이용', title: '', content: '' });
  };

  const addAnswer = () => {
    if (!answer.trim()) return;
    setInquiries(prev => prev.map(item => item.id === selectedId ? { ...item, status: 'ANSWERED', answer, answeredAt: '2026.07.09 10:42' } : item));
    setAnswer('');
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div><h1 className="welcome-title">고객센터</h1><p className="welcome-subtitle">궁금한 내용을 빠르게 확인하고 담당자에게 1:1 문의할 수 있습니다.</p></div>
          <button onClick={() => setWriteOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 700 }}><Plus size={18} /> 문의 작성</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) 320px', gap: 20, marginBottom: 24 }}>
          <section style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '17px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}><Bot size={23} /></div>
              <div><strong>BidMatch 이용 도우미</strong><div style={{ fontSize: 12, color: '#16a34a', marginTop: 3 }}>● 상담 가능</div></div>
            </div>
            <div style={{ height: 230, overflowY: 'auto', padding: 20, background: '#f8fafc' }}>
              {messages.map((message, i) => <div key={i} style={{ display: 'flex', justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ maxWidth: '76%', padding: '11px 14px', borderRadius: message.from === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', background: message.from === 'user' ? '#2563eb' : '#fff', color: message.from === 'user' ? '#fff' : '#334155', border: message.from === 'bot' ? '1px solid #e2e8f0' : 'none', fontSize: 14, lineHeight: 1.55 }}>
                  {message.text}{message.link && <button onClick={() => navigate(message.link)} style={{ display: 'flex', alignItems: 'center', color: '#2563eb', fontWeight: 700, marginTop: 8 }}>{message.label}<ChevronRight size={15} /></button>}
                </div>
              </div>)}
            </div>
            <div style={{ padding: '12px 18px 16px' }}>
              <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>{quickQuestions.map(q => <button key={q} onClick={() => sendChat(q)} style={{ padding: '7px 10px', borderRadius: 16, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 600 }}>{q}</button>)}</div>
              <div style={{ display: 'flex', gap: 8 }}><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="궁금한 내용을 입력해 주세요." style={{ ...field, height: 42 }} /><button onClick={() => sendChat()} style={{ width: 46, borderRadius: 8, background: '#0f172a', color: '#fff' }}><Send size={18} /></button></div>
            </div>
          </section>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              [MessageCircle, '전체 문의', inquiries.length, '#2563eb', '#eff6ff'],
              [Clock3, '답변 대기', waiting, '#ea580c', '#fff7ed'],
              [CheckCircle2, '답변 완료', inquiries.length - waiting, '#16a34a', '#f0fdf4']
            ].map(([Icon, label, value, color, bg]) => <div key={label} style={{ ...card, padding: '19px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</div><div style={{ fontSize: 25, fontWeight: 800, marginTop: 4 }}>{value}<span style={{ fontSize: 14, marginLeft: 4 }}>건</span></div></div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: 'grid', placeItems: 'center' }}><Icon size={22} /></div>
            </div>)}
          </div>
        </div>

        <section style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h2 style={{ fontSize: 17 }}>{isAdmin ? '고객 문의 관리' : '나의 문의 내역'}</h2><p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{isAdmin ? '접수된 문의를 확인하고 답변을 등록합니다.' : '문의 내용과 담당자의 답변 결과를 확인합니다.'}</p></div>
            <div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="문의 검색" style={{ ...field, width: 220, height: 40, paddingLeft: 36 }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '42% 58%', minHeight: 340 }}>
            <div style={{ borderRight: '1px solid #e2e8f0' }}>{filtered.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} style={{ width: '100%', padding: '17px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: selectedId === item.id ? '#eff6ff' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 12, color: '#64748b' }}>{item.category} · {item.id}</span><span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: item.status === 'ANSWERED' ? '#15803d' : '#c2410c', background: item.status === 'ANSWERED' ? '#dcfce7' : '#ffedd5' }}>{item.status === 'ANSWERED' ? '답변 완료' : '답변 대기'}</span></div>
              <strong style={{ fontSize: 14 }}>{item.title}</strong><div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{item.createdAt}</div>
            </button>)}</div>
            {selected && <div style={{ padding: '23px 26px' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{selected.category} · {selected.createdAt}</div><h3 style={{ fontSize: 17, marginBottom: 13 }}>{selected.title}</h3><p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{selected.content}</p>
              <div style={{ marginTop: 20, padding: 18, background: selected.answer ? '#f0f9ff' : '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', fontWeight: 800, fontSize: 14, marginBottom: 9 }}><Headphones size={17} /> 고객센터 답변</div>
                {selected.answer ? <><p style={{ fontSize: 14, lineHeight: 1.65 }}>{selected.answer}</p><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>답변일시 {selected.answeredAt}</div></> : isAdmin ? <div><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="답변을 입력해 주세요." style={{ ...field, minHeight: 78, padding: 10, resize: 'vertical' }} /><button onClick={addAnswer} style={{ float: 'right', marginTop: 8, padding: '8px 15px', background: '#2563eb', color: '#fff', borderRadius: 7, fontWeight: 700 }}>답변 등록</button></div> : <p style={{ fontSize: 13, color: '#64748b' }}>담당자가 문의 내용을 확인하고 있습니다. 답변 등록 시 알림으로 안내합니다.</p>}
              </div>
            </div>}
          </div>
        </section>
      </div>

      {writeOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.55)', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 520, background: '#fff', borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,.24)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><h2 style={{ fontSize: 18 }}>1:1 문의 작성</h2><button onClick={() => setWriteOpen(false)}><X size={21} /></button></div>
          <div style={{ padding: '22px 24px', display: 'grid', gap: 15 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>문의 유형<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...field, height: 42, marginTop: 7 }}><option>서비스 이용</option><option>기업 인증</option><option>공고 정보</option><option>기타</option></select></label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>제목<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="문의 제목을 입력해 주세요." style={{ ...field, height: 42, marginTop: 7 }} /></label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>문의 내용<textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="문의 내용을 자세히 입력해 주세요." style={{ ...field, minHeight: 120, marginTop: 7, padding: 12, resize: 'vertical' }} /></label>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 9 }}><button onClick={() => setWriteOpen(false)} style={{ padding: '10px 18px', border: '1px solid #cbd5e1', borderRadius: 7, fontWeight: 700 }}>취소</button><button onClick={addInquiry} style={{ padding: '10px 18px', background: '#2563eb', color: '#fff', borderRadius: 7, fontWeight: 700 }}>문의 등록</button></div>
        </div>
      </div>}
    </Layout>
  );
}

export default SupportCenter;
