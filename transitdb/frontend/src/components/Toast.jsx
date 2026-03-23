import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

let _push = null;

export function useToast() {
  const push = useCallback((msg, type = 'info') => { _push?.(msg, type); }, []);
  return push;
}

const TOAST_ICONS = {
  ok:   <CheckCircle size={15} color="var(--green)"/>,
  err:  <XCircle    size={15} color="var(--red)"/>,
  info: <Info       size={15} color="var(--accent)"/>,
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _push = (msg, type) => {
      const id = Date.now();
      setToasts(t => [...t, { id, msg, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
  }, []);

  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '11px 16px', borderRadius: 'var(--r)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: `3px solid ${t.type === 'ok' ? 'var(--green)' : t.type === 'err' ? 'var(--red)' : 'var(--accent)'}`,
          boxShadow: 'var(--sh3)', fontSize: '.82rem', fontWeight: 500, maxWidth: '320px',
          animation: 'fadeUp .3s ease-out',
        }}>
          <span style={{ flexShrink: 0, marginTop: '1px' }}>{TOAST_ICONS[t.type] || TOAST_ICONS.info}</span>
          <span style={{ color: 'var(--text)' }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}