import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tasksApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = {
  LOW: '#22c55e', MEDIUM: '#4f7ef8', HIGH: '#f59e0b', CRITICAL: '#ef4444'
};
const STATUS_COLORS = {
  OPEN: '#4f7ef8', IN_PROGRESS: '#f59e0b', UNDER_REVIEW: '#06b6d4',
  RESOLVED: '#22c55e', CLOSED: '#6b7280'
};

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{label}</span>
  );
}

function CreateModal({ onClose, onCreated, users }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', assigneeId: '', dueDate: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, assigneeId: form.assigneeId || undefined, dueDate: form.dueDate || undefined, tags: form.tags || undefined };
      const res = await tasksApi.create(payload);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setLoading(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
  const modal = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px', width: 480, maxHeight: '90vh', overflowY: 'auto' };
  const inp = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--text)', marginBottom: 14, outline: 'none' };
  const sel = { ...inp, appearance: 'none' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Create new task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '8px 12px', color: '#fca5a5', fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Title *</label>
          <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Describe the task..." required />

          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Description</label>
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional context..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Type</label>
              <select style={sel} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['TASK', 'INCIDENT', 'BUG', 'FEATURE'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Priority</label>
              <select style={sel} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Assignee</label>
          <select style={sel} value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Due date</label>
              <input type="date" style={inp} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>Tags</label>
              <input style={inp} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="auth,backend,urgent" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', type: '', search: '', page: 0 });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new')) setShowCreate(true);
  }, [searchParams]);

  useEffect(() => {
    usersApi.getAll().then(r => setUsers(r.data.data || [])).catch(() => {});
  }, []);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    const params = { page: filters.page, size: 15, sortBy: 'createdAt', sortDir: 'desc' };
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;

    tasksApi.getAll(params)
      .then(r => {
        setTasks(r.data.data?.content || []);
        setTotalPages(r.data.data?.totalPages || 0);
        setTotalElements(r.data.data?.totalElements || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 0 }));

  const filterStyle = {
    padding: '7px 12px', background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 7, color: 'var(--text)', outline: 'none', fontSize: 13,
  };

  return (
    <div>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchTasks} users={users} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Tasks</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>{totalElements} total items</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '10px 18px', background: 'var(--accent)', border: 'none',
          borderRadius: 8, color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 14,
        }}>+ New task</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          style={{ ...filterStyle, minWidth: 200 }}
          placeholder="🔍  Search tasks..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select style={filterStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All status</option>
          {['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={filterStyle} value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
          <option value="">All priority</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={filterStyle} value={filters.type} onChange={e => setFilter('type', e.target.value)}>
          <option value="">All types</option>
          {['TASK', 'INCIDENT', 'BUG', 'FEATURE'].map(t => <option key={t}>{t}</option>)}
        </select>
        {(filters.status || filters.priority || filters.type || filters.search) && (
          <button onClick={() => setFilters({ status: '', priority: '', type: '', search: '', page: 0 })}
            style={{ ...filterStyle, cursor: 'pointer', color: 'var(--text3)' }}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Title', 'Type', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No tasks found</td></tr>
            ) : tasks.map(task => (
              <tr key={task.id} onClick={() => navigate(`/app/tasks/${task.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '13px 16px', maxWidth: 280 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.overdue && <span title="Overdue" style={{ color: '#ef4444', marginRight: 5 }}>!</span>}
                    {task.title}
                  </div>
                  {task.tags && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{task.tags}</div>}
                </td>
                <td style={{ padding: '13px 16px' }}><Badge label={task.type} color="#8b92a5" /></td>
                <td style={{ padding: '13px 16px' }}><Badge label={task.status} color={STATUS_COLORS[task.status] || '#8b92a5'} /></td>
                <td style={{ padding: '13px 16px' }}><Badge label={task.priority} color={PRIORITY_COLORS[task.priority] || '#8b92a5'} /></td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                  {task.assignee?.fullName || task.assignee?.username || <span style={{ color: 'var(--text3)' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: task.overdue ? '#ef4444' : 'var(--text2)' }}>
                  {task.dueDate || <span style={{ color: 'var(--text3)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            style={{ padding: '7px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer' }}>← Prev</button>
          <span style={{ padding: '7px 14px', color: 'var(--text2)', fontSize: 13 }}>Page {filters.page + 1} of {totalPages}</span>
          <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            style={{ padding: '7px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
