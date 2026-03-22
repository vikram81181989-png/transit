import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, AlertTriangle, LogIn, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (_err) {
      setError('Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 16px rgba(37,99,235,.35)' }}>
            <Bus size={26} color="#fff"/>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '.3rem' }}>Welcome to <span style={{ color: 'var(--accent)' }}>TransitDB</span></h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>Transport Management System</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--sh3)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Sign In</h2>

          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r2)', padding: '10px 14px', marginBottom: '1rem', fontSize: '.82rem', color: 'var(--red)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14}/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)' }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email')(e.target.value)}
                placeholder="admin@transitdb.com" required
                style={{ padding: '10px 13px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.9rem', color: 'var(--text)', outline: 'none', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)' }}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password')(e.target.value)}
                placeholder="••••••••" required
                style={{ padding: '10px 13px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.9rem', color: 'var(--text)', outline: 'none', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '.9rem', marginTop: '.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {loading ? <><Loader size={14}/> Signing in…</> : <><LogIn size={14}/> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Demo Accounts</p>
            {[
              { email: 'admin@transitdb.com',    role: 'admin',    label: 'Admin — Full access' },
              { email: 'operator@transitdb.com', role: 'operator', label: 'Operator — Read/Write' },
              { email: 'viewer@transitdb.com',   role: 'viewer',   label: 'Viewer — Read only' },
            ].map(a => (
              <button key={a.email} onClick={() => setForm({ email: a.email, password: 'password' })}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 3px', borderRadius: '4px', fontSize: '.78rem', color: 'var(--text2)', transition: 'background .12s', textAlign: 'left' }}>
                <span className={`chip ${a.role}`}>{a.role}</span>
                <span>{a.label}</span>
              </button>
            ))}
            <p style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: '.4rem' }}>Password for all: <code style={{ background: 'var(--surface3)', padding: '1px 5px', borderRadius: '3px' }}>password</code></p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.82rem', color: 'var(--text2)' }}>
            No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}