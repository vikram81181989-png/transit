import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, AlertTriangle, UserPlus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (_err) {
      setError('Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { padding: '10px 13px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.9rem', color: 'var(--text)', outline: 'none', transition: 'border-color .2s', width: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 16px rgba(37,99,235,.35)' }}>
            <Bus size={26} color="#fff"/>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Account</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginTop: '.3rem' }}>Join TransitDB</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--sh3)' }}>
          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r2)', padding: '10px 14px', marginBottom: '1rem', fontSize: '.82rem', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14}/> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {[
              { key: 'name',     label: 'Full Name', type: 'text',     ph: 'John Doe' },
              { key: 'email',    label: 'Email',     type: 'email',    ph: 'you@example.com' },
              { key: 'password', label: 'Password',  type: 'password', ph: '••••••••' }
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.ph} required
                  onChange={e => set(f.key)(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)' }}>Role</label>
              <select value={form.role} onChange={e => set('role')(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="viewer">Viewer — Read only</option>
                <option value="operator">Operator — Read/Write</option>
                <option value="admin">Admin — Full access</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {loading ? <><Loader size={14}/> Creating account…</> : <><UserPlus size={14}/> Create Account</>}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.82rem', color: 'var(--text2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}