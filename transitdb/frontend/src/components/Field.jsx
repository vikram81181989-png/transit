export default function Field({ label, type = 'text', value, onChange, options, required, hint, disabled }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--r2)', color: 'var(--text)',
    fontFamily: "'Outfit', sans-serif", fontSize: '.88rem',
    outline: 'none', transition: 'all .15s',
    opacity: disabled ? .6 : 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text2)', display: 'flex', gap: '5px', alignItems: 'center' }}>
        {label}
        {required && <span style={{ color: 'var(--red)' }}>*</span>}
        {hint && <span style={{ color: 'var(--text3)', fontWeight: 400, fontFamily: "'Fira Code', monospace", fontSize: '.67rem' }}>{hint}</span>}
      </label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <option value="">— Select —</option>
          {options?.map(o => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} disabled={disabled}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          required={required} disabled={disabled}
          style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'text' }} />
      )}
    </div>
  );
}
