import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi, commentsApi, historyApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = {
  LOW: '#22c55e', MEDIUM: '#4f7ef8', HIGH: '#f59e0b', CRITICAL: '#ef4444'
};
const STATUS_COLORS = {
  OPEN: '#4f7ef8', IN_PROGRESS: '#f59e0b', UNDER_REVIEW: '#06b6d4',
  RESOLVED: '#22c55e', CLOSED: '#6b7280'
};
const STATUS_FLOW = ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];

function Badge({ label, color, large }) {
  return (
    <span style={{
      fontSize: large ? 13 : 11, fontWeight: 500,
      padding: large ? '4px 12px' : '2px 8px', borderRadius: 10,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{label}</span>
  );
}

function Avatar({ name, size = 28 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [taskRes, commentsRes, historyRes] = await Promise.all([
        tasksApi.getById(id),
        commentsApi.getAll(id, { page: 0, size: 50 }),
        historyApi.get(id),
      ]);
      setTask(taskRes.data.data);
      setComments(commentsRes.data.data?.content || []);
      setHistory(historyRes.data.data || []);
    } catch (e) {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    usersApi.getAll().then(r => setUsers(r.data.data || [])).catch(() => {});
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setStatusLoading(true);
    try {
      const res = await tasksApi.updateStatus(id, { status: newStatus });
      setTask(res.data.data);
      const histRes = await historyApi.get(id);
      setHistory(histRes.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Status update failed');
      setTimeout(() => setError(''), 3000);
    } finally { setStatusLoading(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.add(id, { content: commentText });
      setCommentText('');
      const res = await commentsApi.getAll(id, { page: 0, size: 50 });
      setComments(res.data.data?.content || []);
    } catch (e) {
      setError('Failed to add comment');
    } finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.delete(commentId);
      setComments(c => c.filter(x => x.id !== commentId));
    } catch (e) {
      setError('Failed to delete comment');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await tasksApi.update(id, editForm);
      setTask(res.data.data);
      setEditMode(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await tasksApi.delete(id);
      navigate('/app/tasks');
    } catch (e) {
      setError('Delete failed');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text3)' }}>
      Loading task...
    </div>
  );
  if (!task) return (
    <div style={{ color: 'var(--text3)', padding: 40, textAlign: 'center' }}>
      Task not found. <button onClick={() => navigate('/app/tasks')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
    </div>
  );

  const inp = { width: '100%', padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--text)', outline: 'none', fontSize: 14, marginBottom: 10 };
  const sel = { ...inp };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/app/tasks')} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 7, padding: '7px 14px', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
        }}>← Back</button>
        <div style={{ flex: 1 }} />
        {error && <span style={{ color: '#fca5a5', fontSize: 13 }}>⚠ {error}</span>}
        {!editMode && (
          <button onClick={() => { setEditMode(true); setEditForm({ title: task.title, description: task.description, priority: task.priority, assigneeId: task.assignee?.id || '', dueDate: task.dueDate || '', tags: task.tags || '', resolutionNotes: task.resolutionNotes || '' }); }}
            style={{ padding: '7px 16px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
            ✏ Edit
          </button>
        )}
        {isAdmin && (
          <button onClick={handleDelete}
            style={{ padding: '7px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#fca5a5', cursor: 'pointer', fontSize: 13 }}>
            🗑 Delete
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Title + badges */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
            {editMode ? (
              <>
                <input style={{ ...inp, fontSize: 18, fontWeight: 600 }} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                <textarea style={{ ...inp, height: 100, resize: 'vertical' }} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select style={sel} value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}>
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
                  </select>
                  <select style={sel} value={editForm.assigneeId || ''} onChange={e => setEditForm(f => ({ ...f, assigneeId: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                  </select>
                  <input type="date" style={sel} value={editForm.dueDate || ''} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} />
                  <input style={sel} value={editForm.tags || ''} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} placeholder="tags..." />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--text2)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSaveEdit} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Save changes</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <Badge label={task.type} color="#8b92a5" />
                  <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]} />
                  {task.overdue && <Badge label="OVERDUE" color="#ef4444" />}
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 14, lineHeight: 1.3 }}>{task.title}</h1>
                {task.description && (
                  <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{task.description}</p>
                )}
                {task.tags && (
                  <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {task.tags.split(',').map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg3)', borderRadius: 10, color: 'var(--text3)', border: '1px solid var(--border)' }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {task.resolutionNotes && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#22c55e', marginBottom: 4, fontWeight: 500 }}>RESOLUTION</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{task.resolutionNotes}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status pipeline */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status pipeline</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_FLOW.map(s => {
                const isCurrent = task.status === s;
                const color = STATUS_COLORS[s];
                return (
                  <button key={s} disabled={statusLoading || isCurrent} onClick={() => handleStatusChange(s)}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: `1px solid ${isCurrent ? color : 'var(--border)'}`,
                      background: isCurrent ? `${color}22` : 'var(--bg3)',
                      color: isCurrent ? color : 'var(--text2)',
                      fontWeight: isCurrent ? 600 : 400, cursor: isCurrent ? 'default' : 'pointer',
                      fontSize: 12, transition: 'all 0.15s',
                    }}>
                    {isCurrent ? '● ' : ''}{s.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs: Comments / History */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {['comments', 'history'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '13px 20px', background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
                  fontWeight: activeTab === tab ? 500 : 400,
                  cursor: 'pointer', fontSize: 13, marginBottom: -1,
                }}>
                  {tab === 'comments' ? `💬 Comments (${comments.length})` : `📜 History (${history.length})`}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 22px' }}>
              {activeTab === 'comments' ? (
                <>
                  {comments.length === 0 ? (
                    <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No comments yet</div>
                  ) : (
                    <div style={{ marginBottom: 20 }}>
                      {comments.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                          <Avatar name={c.author?.fullName || c.author?.username} size={32} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                              <span style={{ fontWeight: 500, fontSize: 13 }}>{c.author?.fullName || c.author?.username}</span>
                              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                              {(c.author?.username === user?.username || isAdmin) && (
                                <button onClick={() => handleDeleteComment(c.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                              )}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8 }}>
                              {c.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      style={{ flex: 1, padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', resize: 'none', height: 72, outline: 'none', fontSize: 13 }}
                      onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddComment(e); }}
                    />
                    <button type="submit" disabled={submitting || !commentText.trim()} style={{
                      padding: '10px 18px', background: 'var(--accent)', border: 'none',
                      borderRadius: 8, color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: 13,
                    }}>Post</button>
                  </form>
                </>
              ) : (
                <div>
                  {history.length === 0 ? (
                    <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No history yet</div>
                  ) : history.map(h => (
                    <div key={h.id} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                          <span style={{ fontWeight: 500 }}>{h.changedBy}</span>
                          {' changed '}
                          <span style={{ color: 'var(--accent)' }}>{h.fieldName}</span>
                          {h.oldValue && <> from <span style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>{h.oldValue}</span></>}
                          {h.newValue && <> to <span style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#22c55e' }}>{h.newValue}</span></>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(h.changedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', marginBottom: 14 }}>
            <Section title="Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Status', value: <Badge label={task.status} color={STATUS_COLORS[task.status]} large /> },
                  { label: 'Priority', value: <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]} large /> },
                  { label: 'Type', value: <Badge label={task.type} color="#8b92a5" large /> },
                  { label: 'Due date', value: task.dueDate ? <span style={{ color: task.overdue ? '#ef4444' : 'var(--text2)', fontSize: 13 }}>{task.dueDate}</span> : <span style={{ color: 'var(--text3)', fontSize: 13 }}>—</span> },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{row.label}</span>
                    {row.value}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', marginBottom: 14 }}>
            <Section title="People">
              {[
                { label: 'Reporter', person: task.reporter },
                { label: 'Assignee', person: task.assignee },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{row.label}</div>
                  {row.person ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={row.person.fullName || row.person.username} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{row.person.fullName || row.person.username}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{row.person.department || row.person.role}</div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Unassigned</span>
                  )}
                </div>
              ))}
            </Section>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
            <Section title="Timestamps">
              {[
                { label: 'Created', value: task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—' },
                { label: 'Updated', value: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '—' },
                { label: 'Created by', value: task.createdBy || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{row.value}</span>
                </div>
              ))}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
