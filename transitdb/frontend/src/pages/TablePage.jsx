import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, Download, Plus, Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TABLE_CONFIG } from '../config/tables';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { useToast } from '../components/Toast';
import ToastContainer from '../components/Toast';

export default function TablePage({ table }) {
  const { user }  = useAuth();
  const config    = TABLE_CONFIG[table];
  const toast     = useToast();
  const canWrite  = ['admin','operator'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const pkKey = config.columns.find(c => c.pk)?.key;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/${table}`);
      setRows(r.data.data);
    } catch (_e) {
      toast('Failed to load data', 'err');
    } finally { setLoading(false); }
  }, [table, toast]);

  useEffect(() => { load(); setSearch(''); }, [table, load]);

  const filtered = rows.filter(row =>
    Object.values(row).some(v => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setForm({}); setModal('add'); };

  const openEdit = (row) => {
    const f = {};
    config.fields.forEach(fi => { f[fi.key] = row[fi.key] ?? ''; });
    setForm(f);
    setModal({ type: 'edit', id: row[pkKey] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post(`/${table}`, form);
        toast(`New ${table.slice(0,-1)} added`, 'ok');
      } else {
        await api.put(`/${table}/${modal.id}`, form);
        toast(`${table.slice(0,-1)} #${modal.id} updated`, 'ok');
      }
      setModal(null);
      load();
    } catch (_e) {
      toast('Save failed', 'err');
    } finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete record #${row[pkKey]} from ${table}? This cannot be undone.`)) return;
    setDeleting(row[pkKey]);
    try {
      await api.delete(`/${table}/${row[pkKey]}`);
      toast(`Record #${row[pkKey]} deleted`, 'ok');
      load();
    } catch (_e) {
      toast('Delete failed', 'err');
    } finally { setDeleting(null); }
  };

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = config.columns.map(c => c.key);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${table}.csv`;
    a.click();
    toast(`Exported ${table}.csv`, 'ok');
  };

  // suppress unused warning
  void deleting;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ToastContainer />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{config.icon}</span>{config.label}
            <span style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1px 10px', fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', fontFamily: "'Fira Code',monospace" }}>{rows.length} rows</span>
          </h1>
          <p style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: '.2rem' }}>MySQL · transitdb.{table} · live data</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${table}…`}
            style={{ padding: '8px 13px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', fontSize: '.85rem', color: 'var(--text)', outline: 'none', width: '200px', transition: 'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <button className="btn" onClick={load} title="Reload from MySQL">
            <RefreshCw size={14}/>
          </button>
          <button className="btn" onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <Download size={14}/> CSV
          </button>
          {canWrite && (
            <button className="btn primary" onClick={openAdd} style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <Plus size={14}/> Add Row
            </button>
          )}
        </div>
      </div>

      {/* Role notice */}
      {!canWrite && (
        <div style={{ background: 'var(--amber-bg)', border: '1px solid #fde68a', borderRadius: 'var(--r2)', padding: '8px 14px', fontSize: '.8rem', color: 'var(--amber)', fontWeight: 500, display:'flex', alignItems:'center', gap:'6px' }}>
          <Eye size={14}/> Viewer mode — read only. Ask an admin to make changes.
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4rem', textAlign: 'center', color: 'var(--text2)' }}>
          Loading from MySQL…
        </div>
      ) : (
        <DataTable
          columns={config.columns}
          rows={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
          canEdit={canWrite}
          canDelete={canDelete}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add'
          ? `Add ${config.label.slice(0,-1)}`
          : `Edit ${config.label.slice(0,-1)} #${modal?.id}`}
        footer={<>
          <button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : modal === 'add' ? 'Insert to MySQL' : 'Update MySQL'}
          </button>
        </>}>
        {config.fields.map(f => (
          <Field key={f.key}
            label={f.label} type={f.type}
            value={form[f.key] ?? ''}
            onChange={v => setForm(fm => ({ ...fm, [f.key]: v }))}
            options={f.options}
            required={f.required}
            hint={f.hint}
          />
        ))}
      </Modal>
    </div>
  );
}

TablePage.propTypes = {
  table: PropTypes.string.isRequired
};