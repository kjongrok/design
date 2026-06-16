import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { RefreshCcw, AlertCircle, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/logs').then(res => {
      if (res.data.success) {
        setLogs(res.data.system_logs || []);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="dashboard-container">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/admin')} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card-bg)', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} color="#64748b" />
          </button>
          <div>
            <h1 className="welcome-title" style={{ marginBottom: 0 }}>전체 시스템 로그</h1>
            <p className="welcome-subtitle">나라장터 공고 수집 및 시스템 상태 기록을 전체 확인합니다.</p>
          </div>
        </div>

        <div className="panel" style={{ minHeight: '600px' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>로그를 불러오는 중입니다...</div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>기록된 로그가 없습니다.</div>
            ) : (
              logs.map(log => {
                let Icon = Info;
                let bgColor = '#f8fafc';
                let borderColor = '#3b82f6';
                let color = '#3b82f6';
                
                if (log.type === 'danger') {
                  Icon = AlertCircle;
                  bgColor = '#fef2f2';
                  borderColor = '#ef4444';
                  color = '#ef4444';
                } else if (log.type === 'success') {
                  Icon = CheckCircle2;
                  bgColor = '#f0fdf4';
                  borderColor = '#22c55e';
                  color = '#22c55e';
                } else if (log.type === 'warning') {
                  Icon = RefreshCcw;
                  bgColor = '#fff7ed';
                  borderColor = '#f97316';
                  color = '#f97316';
                }

                return (
                  <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '20px', backgroundColor: bgColor, borderLeft: `4px solid ${borderColor}`, borderRadius: '0 8px 8px 0' }}>
                    <Icon size={20} color={color} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '14px', color: color }}>{log.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{log.date} {log.time}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default AdminLogs;
