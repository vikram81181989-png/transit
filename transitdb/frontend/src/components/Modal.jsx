export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', width: '500px', maxWidth: '94vw', boxShadow: 'var(--sh3)', overflow: 'hidden', animation: 'fadeUp .2s ease-out' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '1.1rem', cursor: 'pointer', padding: '3px 6px', borderRadius: '5px' }}>✕</button>
        </div>
        <div style={{ padding: '18px 20px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
