import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STAT_CONFIG = [
  { key: 'routes',      icon: '🗺️', label: 'Routes',      color: '#2563eb', bg: '#eff6ff',  link: '/routes' },
  { key: 'vehicles',    icon: '🚌', label: 'Vehicles',    color: '#059669', bg: '#ecfdf5',  link: '/vehicles' },
  { key: 'schedules',   icon: '🕐', label: 'Schedules',   color: '#d97706', bg: '#fffbeb',  link: '/schedules' },
  { key: 'passengers',  icon: '👤', label: 'Passengers',  color: '#7c3aed', bg: '#f5f3ff',  link: '/passengers' },
  { key: 'bookings',    icon: '🎫', label: 'Bookings',    color: '#0284c7', bg: '#f0f9ff',  link: '/bookings' },
  { key: 'staff',       icon: '👷', label: 'Staff',       color: '#dc2626', bg: '#fef2f2',  link: '/staff' },
  { key: 'totalRevenue',icon: '💰', label: 'Revenue (₹)', color: '#059669', bg: '#ecfdf5',  fmt: v => '₹'+Number(v).toLocaleString('en-IN') },
  { key: 'activeVehicles', icon: '✅', label: 'Active Vehicles', color: '#059669', bg: '#ecfdf5' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [recent,   setRecent]   = useState([]);
  const [audit,    setAudit]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    try {
      const [s, r, a] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-bookings'),
        api.get('/dashboard/audit?limit=8'),
      ]);
      setStats(s.data.data);
      setRecent(r.data.data);
      setAudit(a.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>⏳ Loading dashboard…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 'var(--r)', padding: '1.25rem 1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(37,99,235,.3)' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.25rem' }}>Welcome back, {user?.name} 👋</h1>
          <p style={{ fontSize: '.83rem', opacity: .85 }}>Live MySQL database — auto-refreshes every 15s</p>
        </div>
        <button onClick={load} style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--r2)', fontWeight: 600, fontSize: '.82rem', cursor: 'pointer' }}>↺ Refresh</button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '10px' }}>
        {STAT_CONFIG.map(s => (
          <div key={s.key} onClick={() => s.link && navigate(s.link)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--sh1)', cursor: s.link ? 'pointer' : 'default', transition: 'all .15s' }}
            onMouseEnter={e => { if (s.link) { e.currentTarget.style.boxShadow = 'var(--sh2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh1)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>
                {s.fmt ? s.fmt(stats?.[s.key] ?? 0) : (stats?.[s.key] ?? 0)}
              </div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Bookings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh2)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontWeight: 800, fontSize: '.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            🎫 Recent Bookings
            <button className="btn sm" onClick={() => navigate('/bookings')}>View all →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                {['#','Passenger','Route','Amount','Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontFamily: "'Fira Code',monospace", fontSize: '.63rem', color: 'var(--text2)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.6px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b.booking_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: "'Fira Code',monospace", fontSize: '.74rem', color: 'var(--amber)', fontWeight: 600 }}>{b.booking_id}</td>
                    <td style={{ padding: '8px 12px', fontSize: '.8rem', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: '8px 12px', fontSize: '.75rem', color: 'var(--text2)' }}>{b.source}→{b.destination}</td>
                    <td style={{ padding: '8px 12px', fontSize: '.78rem', fontFamily: "'Fira Code',monospace" }}>₹{b.amount}</td>
                    <td style={{ padding: '8px 12px' }}><span className={`chip ${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh2)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontWeight: 800, fontSize: '.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            📋 Recent Activity
            <button className="btn sm" onClick={() => navigate('/audit')}>View all →</button>
          </div>
          <div style={{ padding: '0' }}>
            {audit.map(a => (
              <div key={a.log_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{a.action === 'INSERT' ? '➕' : a.action === 'UPDATE' ? '✏️' : '🗑️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 600 }}>
                    <span style={{ color: a.action === 'INSERT' ? 'var(--green)' : a.action === 'UPDATE' ? 'var(--amber)' : 'var(--red)' }}>{a.action}</span>
                    {' '}<span style={{ fontFamily: "'Fira Code',monospace", fontSize: '.74rem' }}>{a.table_name}</span> #{a.record_id}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>by {a.user_name || 'system'} · {new Date(a.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {!audit.length && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>No activity yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
