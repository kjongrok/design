import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, BellRing, Target, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} color="#3b82f6" />
          <span style={{ fontSize: '20px', fontWeight: 800, tracking: 'tight' }}>BidMatch</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              대시보드로 이동
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: '#f8fafc', fontWeight: 600, border: '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                로그인
              </button>
              <button 
                onClick={() => navigate('/signup')}
                style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                무료 회원가입
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '120px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Abstract Background Blur */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', backgroundColor: 'rgba(59, 130, 246, 0.3)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', backgroundColor: 'rgba(139, 92, 246, 0.2)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '9999px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '14px', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            ✨ 차세대 나라장터 입찰 정보 분석 플랫폼
          </div>
          
          <h1 style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            놓치기 쉬운 핵심 공고,<br/>
            <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI가 완벽하게 찾아냅니다.</span>
          </h1>
          
          <p style={{ fontSize: '20px', color: '#94a3b8', marginBottom: '48px', lineHeight: 1.6 }}>
            수만 건의 조달청 데이터를 실시간으로 분석하여 귀사에 딱 맞는 입찰 공고를 매칭해 드립니다. 가장 빠르고 스마트하게 수주 성공률을 높이세요.
          </p>
          
          <button 
            onClick={handleCtaClick}
            style={{ padding: '16px 32px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '18px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', transition: 'transform 0.2s', boxShadow: '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            지금 바로 시작하기 <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 48px', backgroundColor: '#1e293b', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>핵심 기능</h2>
            <p style={{ fontSize: '16px', color: '#94a3b8' }}>BidMatch가 제공하는 강력한 도구들로 비즈니스 기회를 창출하세요.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            
            <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #334155', transition: 'all 0.3s' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Target size={28} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>정밀한 조건 매칭</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>업종, 지역, 금액, 키워드 등 세밀한 조건 설정으로 불필요한 정보는 거르고 꼭 필요한 공고만 확인하세요.</p>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #334155', transition: 'all 0.3s' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <BellRing size={28} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>실시간 알림</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>조건에 맞는 신규 공고가 등록되면 이메일과 앱 알림으로 주요 일정을 안내하여 골든타임을 확보합니다.</p>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #334155', transition: 'all 0.3s' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <BarChart3 size={28} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>데이터 대시보드</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>직관적인 대시보드를 통해 관심 공고의 진행 상태와 예상 경쟁률 등 주요 지표를 한눈에 파악하세요.</p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '48px', textAlign: 'center', borderTop: '1px solid #334155', color: '#64748b' }}>
        <p>© 2026 BidMatch. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default LandingPage;
