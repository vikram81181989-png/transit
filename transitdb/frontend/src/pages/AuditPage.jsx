import { useEffect, useState } from 'react';
import api from '../api/axios';

const ACTION_STYLE = {
  INSERT: { color: 'var(--green)',  bg: 'var(--green-bg)',  icon: '➕' },
  UPDATE: { color: 'var(--amber)',  bg: 'var(--amber-bg)',  icon: '✏️' },
  DELETE: { color: 'var(--red)',    bg: 'var(--red-bg)',    icon: '🗑️' },
};

export default function AuditPage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [action,  setAction]  = useState('ALL');

  useEffect(() => {
    api.get('/dashboard/audit?limit=200')
      .then(r => setLogs(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    const matchAction = action === 'ALL' || l.action === action;
    const matchSearch = !filter || [l.table_name, l.user_name, String(l.record_id)].some(v => v?.toLowerCase().includes(filter.toLowerCase()));
    return matchAction && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>📋 Audit Log</h1>
        <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.2rem' }}>Every INSERT, UPDATE, DELETE tracked in MySQL with user, timestamp, and changes</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="Search table, user, record ID…"
          style={{ padding: '8px 13px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.85rem', color: 'var(--text)', outline: 'none', width: '240px' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        {['ALL','INSERT','UPDATE','DELETE'].map(a => (
          <button key={a} className={`btn sm ${action === a ? 'primary' : ''}`} onClick={() => setAction(a)}>{a}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'Fira Code',monospace", fontSize: '.75rem', color: 'var(--text3)' }}>{filtered.length} entries</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>⏳ Loading audit log…</div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh2)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '2px solid var(--border)' }}>
                {['#','Action','Table','Record ID','User','Changes','Timestamp'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontFamily: "'Fira Code',monospace", fontSize: '.67rem', color: 'var(--text2)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.6px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const s = ACTION_STYLE[l.action] || {};
                let changes = null;
                if (l.changes) { try { changes = JSON.parse(l.changes); } catch {} }
                return (
                  <tr key={l.log_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 14px', fontFamily: "'Fira Code',monospace", fontSize: '.74rem', color: 'var(--amber)', fontWeight: 600 }}>{l.log_id}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '14px', background: s.bg, color: s.color, fontSize: '.7rem', fontWeight: 700 }}>
                        {s.icon} {l.action}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontFamily: "'Fira Code',monospace", fontSize: '.76rem', color: 'var(--accent)', fontWeight: 600 }}>{l.table_name}</td>
                    <td style={{ padding: '9px 14px', fontFamily: "'Fira Code',monospace", fontSize: '.76rem' }}>#{l.record_id}</td>
                    <td style={{ padding: '9px 14px', fontSize: '.8rem' }}>
                      <div style={{ fontWeight: 600 }}>{l.user_name || '—'}</div>
                      {l.email && <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>{l.email}</div>}
                    </td>
                    <td style={{ padding: '9px 14px', maxWidth: '220px' }}>
                      {changes ? (
                        <pre style={{ fontFamily: "'Fira Code',monospace", fontSize: '.65rem', color: 'var(--text2)', background: 'var(--surface2)', padding: '4px 8px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', maxHeight: '60px', overflowY: 'auto' }}>
                          {JSON.stringify(changes, null, 1).slice(0,200)}
                        </pre>
                      ) : <span style={{ color: 'var(--text3)', fontSize: '.76rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '9px 14px', fontFamily: "'Fira Code',monospace", fontSize: '.72rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)' }}>No audit entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
