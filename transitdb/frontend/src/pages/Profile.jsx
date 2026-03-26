import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit3, Check, X, Loader } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ToastContainer, { useToast } from '../components/Toast';

export default function Profile() {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/user/profile');
      setProfile(r.data);
      setForm({
        name:  r.data.user.name   || '',
        phone: r.data.passenger?.phone || '',
        city:  r.data.passenger?.city  || '',
      });
    } catch (_err) {
      toast('Failed to load profile', 'err');
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Name is required', 'err'); return; }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      toast('Invalid phone number (10 digits, starts with 6-9)', 'err');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/profile', { name: form.name.trim(), phone: form.phone.trim() || undefined, city: form.city.trim() || undefined });
      toast('Profile updated successfully!', 'ok');
      setEditing(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'err');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      name:  profile?.user?.name || '',
      phone: profile?.passenger?.phone || '',
      city:  profile?.passenger?.city  || '',
    });
    setEditing(false);
  };

  const infoItems = profile ? [
    { icon: <User size={16}/>,     label: 'Display Name', value: profile.user.name,    editable: true,  field: 'name' },
    { icon: <Mail size={16}/>,     label: 'Email',        value: profile.user.email,   editable: false },
    { icon: <Shield size={16}/>,   label: 'Role',         value: profile.user.role,    editable: false, chip: true },
    { icon: <Phone size={16}/>,    label: 'Mobile',       value: profile.passenger?.phone || '—', editable: true, field: 'phone', placeholder: '10-digit mobile' },
    { icon: <MapPin size={16}/>,   label: 'City',         value: profile.passenger?.city  || '—', editable: true, field: 'city',  placeholder: 'Your city' },
    { icon: <Calendar size={16}/>, label: 'Member Since', value: new Date(profile.user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), editable: false },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px', margin: '0 auto' }}>
      <ToastContainer/>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', borderRadius: 'var(--r)', padding: '1.5rem', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0 }}>
            {authUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '.25rem' }}>{authUser?.name}</h1>
            <p style={{ fontSize: '.8rem', opacity: .85 }}>{authUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh2)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '.9rem' }}>Profile Information</span>
          {!editing ? (
            <button className="btn sm" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Edit3 size={12}/> Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn sm" onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={12}/> Cancel
              </button>
              <button className="btn sm primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {saving ? <Loader size={12}/> : <Check size={12}/>} {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text2)' }}>Loading profile…</div>
        ) : (
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {infoItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: editing && item.editable ? 'flex-start' : 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', background: 'var(--accent-lite)', color: 'var(--accent)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>
                    {item.label}
                  </div>
                  {editing && item.editable ? (
                    <input
                      type="text"
                      value={form[item.field]}
                      placeholder={item.placeholder || ''}
                      onChange={e => setForm(f => ({ ...f, [item.field]: e.target.value }))}
                      style={{ padding: '7px 10px', background: 'var(--surface2)', border: '1.5px solid var(--accent)', borderRadius: 'var(--r2)', fontSize: '.88rem', color: 'var(--text)', outline: 'none', width: '100%', maxWidth: '300px' }}
                    />
                  ) : (
                    <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text)' }}>
                      {item.chip ? <span className={`chip ${item.value}`}>{item.value}</span> : item.value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info note */}
      <div style={{ background: 'var(--amber-bg)', border: '1px solid #fde68a', borderRadius: 'var(--r2)', padding: '10px 14px', fontSize: '.78rem', color: 'var(--amber)', display: 'flex', gap: '8px' }}>
        <span style={{ flexShrink: 0 }}>ℹ️</span>
        <span>Your mobile number and city are shared with your booking profile and updated automatically when you book a ticket.</span>
      </div>
    </div>
  );
}
