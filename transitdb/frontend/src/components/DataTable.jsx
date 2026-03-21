export default function DataTable({ columns, rows, onEdit, onDelete, canEdit, canDelete }) {
  if (!rows?.length) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--sh2)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📭</div>
        <div style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text2)' }}>No records found</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', boxShadow: 'var(--sh2)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '2px solid var(--border)' }}>
              {columns.map(col => (
                <th key={col.key} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: "'Fira Code', monospace", fontSize: '.67rem', fontWeight: 500, color: col.pk ? 'var(--amber)' : col.fk ? 'var(--violet)' : 'var(--text2)', letterSpacing: '.6px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {col.label}
                  {col.pk && <span style={{ fontSize: '.55rem', background: '#fef3c7', color: '#92400e', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px', fontWeight: 700 }}>PK</span>}
                  {col.fk && <span style={{ fontSize: '.55rem', background: '#ede9fe', color: '#5b21b6', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px', fontWeight: 700 }}>FK</span>}
                </th>
              ))}
              <th style={{ textAlign: 'left', padding: '10px 14px', fontFamily: "'Fira Code', monospace", fontSize: '.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.6px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map(col => {
                  let v = row[col.key];
                  if (v === null || v === undefined) v = <span style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: '.72rem' }}>null</span>;
                  else if (col.chip) v = <span className={`chip ${v}`}>{v}</span>;
                  else if (col.mono) v = <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '.76rem' }}>{v}</span>;
                  else if (col.pk)   v = <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '.76rem', color: 'var(--amber)', fontWeight: 600 }}>{v}</span>;
                  else if (col.fk)   v = <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '.76rem', color: 'var(--violet)' }}>{v}</span>;
                  return (
                    <td key={col.key} style={{ padding: '10px 14px', fontSize: '.82rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>{v}</td>
                  );
                })}
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {canEdit   && <button className="btn sm" onClick={() => onEdit(row)}   style={{ fontSize: '.7rem', padding: '3px 9px' }}>✏️ Edit</button>}
                    {canDelete && <button className="btn sm danger" onClick={() => onDelete(row)} style={{ fontSize: '.7rem', padding: '3px 9px' }}>🗑</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
