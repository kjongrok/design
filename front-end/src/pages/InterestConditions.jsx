import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Plus, Cloud, Settings, ShieldAlert, Trash2, X, ChevronDown, TrendingUp } from 'lucide-react';
import api from '../utils/api';

function InterestConditions() {
  const [rules, setRules] = useState([]);
  
  // Form State
  const [ruleName, setRuleName] = useState('');
  const [includeKwInput, setIncludeKwInput] = useState('');
  const [includeKeywords, setIncludeKeywords] = useState([]);
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [region, setRegion] = useState('전국');
  const [bizType, setBizType] = useState('전체 업종');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await api.get('/match-rules');
      if (res.data && res.data.success) {
        setRules(res.data.items || []);
      }
    } catch (err) {
      console.error("조건을 가져오는데 실패했습니다.", err);
    }
  };

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && includeKwInput.trim()) {
      e.preventDefault();
      if (!includeKeywords.includes(includeKwInput.trim())) {
        setIncludeKeywords([...includeKeywords, includeKwInput.trim()]);
      }
      setIncludeKwInput('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setIncludeKeywords(includeKeywords.filter(k => k !== kw));
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      alert("조건 명칭을 입력해주세요.");
      return;
    }
    if (includeKeywords.length === 0) {
      alert("포함 키워드를 1개 이상 입력해주세요.");
      return;
    }

    try {
      const payload = {
        rule_name: ruleName,
        include_keywords: includeKeywords.join(','),
        exclude_keywords: excludeKeywords,
        region,
        biz_types: bizType,
        notification_enabled: true
      };
      
      const res = await api.post('/match-rules', payload);
      if (res.data.success) {
        alert(`조건이 저장되었습니다! (매칭된 공고 수: ${res.data.rule?.matched_count || 0}건)`);
        setRuleName('');
        setIncludeKeywords([]);
        setExcludeKeywords('');
        setRegion('전국');
        setBizType('전체 업종');
        fetchRules();
      }
    } catch (err) {
      console.error(err);
      alert("조건 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 이 조건을 삭제하시겠습니까?")) {
      try {
        const res = await api.delete(`/match-rules/${id}`);
        if (res.data.success) {
          fetchRules();
        }
      } catch (err) {
        console.error(err);
        alert("삭제 실패");
      }
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
        
        <h1 className="welcome-title" style={{ marginBottom: '32px' }}>관심 조건 관리</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="panel" style={{ padding: 0 }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>저장된 관심 조건</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>설정된 조건에 맞춰 실시간 입찰 정보를 안내합니다.</p>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px' }}>
                    등록된 조건이 없습니다. 우측에서 새로운 조건을 추가해보세요.
                  </div>
                ) : (
                  rules.map((rule, idx) => (
                    <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: idx === 0 ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: idx === 0 ? '#eff6ff' : '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: idx === 0 ? '#60a5fa' : '#e2e8f0', color: idx === 0 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Settings size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{rule.rule_name}</div>
                          <div style={{ fontSize: '13px', color: '#475569' }}>
                            {rule.include_keywords} | {rule.region} | {rule.biz_types}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Trash2 size={20} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => handleDelete(rule.id)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px', color: '#fff' }}>
                <div style={{ marginBottom: '16px' }}><Settings size={24} color="#60a5fa" /></div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>매칭 팁</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>유연한 매칭 로직이 적용되어 있습니다. 포함 키워드 중 하나라도 일치하면 매칭되며, 여러 개 일치할수록 점수가 높아집니다.</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="panel" style={{ padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>조건 상세 설정</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>새로운 공고 정보를 필터링할 상세 기준을 입력하세요.</p>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>조건 명칭</label>
                <input type="text" value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="예: 2025년 상반기 IT 시스템 유지보수" style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: '#f8fafc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>포함 키워드 (OR 매칭)</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px', backgroundColor: '#f8fafc', marginBottom: '12px' }}>
                  <input type="text" value={includeKwInput} onChange={e => setIncludeKwInput(e.target.value)} onKeyDown={handleAddKeyword} placeholder="키워드 입력 후 Enter" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} />
                  <Plus size={18} color="#94a3b8" />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {includeKeywords.map(kw => (
                    <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 500 }}>
                      {kw} <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveKeyword(kw)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>제외 키워드 (선택)</label>
                <input type="text" value={excludeKeywords} onChange={e => setExcludeKeywords(e.target.value)} placeholder="제외할 키워드를 콤마(,)로 구분하여 입력" style={{ width: '100%', height: '44px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', fontSize: '14px', backgroundColor: '#f8fafc' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>지역 선택</label>
                  <select value={region} onChange={e => setRegion(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155' }}>
                    <option value="전국">전국</option>
                    <option value="서울">서울</option>
                    <option value="경기">경기</option>
                    <option value="인천">인천</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>업종 구분</label>
                  <select value={bizType} onChange={e => setBizType(e.target.value)} style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 16px', height: '44px', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155' }}>
                    <option value="전체 업종">전체 업종</option>
                    <option value="용역">용역</option>
                    <option value="물품">물품</option>
                    <option value="공사">공사</option>
                  </select>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '16px' }}>
              <button style={{ flex: 1, height: '44px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }} onClick={() => { setRuleName(''); setIncludeKeywords([]); setExcludeKeywords(''); }}>
                초기화
              </button>
              <button onClick={handleSave} style={{ flex: 2, height: '44px', backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', color: '#fff', cursor: 'pointer' }}>
                설정 저장하기
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </Layout>
  );
}

export default InterestConditions;
