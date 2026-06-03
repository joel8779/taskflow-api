import React, { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#4f7ef8', '#22c55e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 10,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{label}</span>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 22px',
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
        </div>
        <div style={{ fontSize: 26 }}>{icon}</div>
      </div>
    </div>
  );
}

function RoleModal({ user, onClose, onUpdated }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    setLoading(true);
    try {
      const res = await usersApi.updateRole(user.id, role);
      onUpdated(res.data.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update role');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px', width: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Change Role</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
          <Avatar name={user.fullName || user.username} size={40} />
          <div>
            <div style={{ fontWeight: 500 }}>{user.fullName || user.username}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{user.email}</div>
          </div>
        </div>
        {error && <div style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Select role</div>
          {['ADMIN', 'USER'].map(r => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, border: `1px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`, background: role === r ? 'rgba(79,126,248,0.08)' : 'var(--bg3)' }}>
              <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} style={{ accentColor: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: role === r ? 'var(--accent)' : 'var(--text)' }}>{r}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r === 'ADMIN' ? 'Full access — manage users, delete tasks' : 'Standard access — create and manage own tasks'}</div>
              </div>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save role'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) navigate('/app');
  }, [isAdmin, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data.data || []);
    } catch (e) {
      setError('Failed to load users');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDeactivate = async (userId, username) => {
    if (!window.confirm(`Deactivate user "${username}"? They will lose access immediately.`)) return;
    setActionLoading(userId);
    try {
      await usersApi.deactivate(userId);
      setUsers(u => u.map(x => x.id === userId ? { ...x, isActive: false } : x));
      showToast(`${username} has been deactivated`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to deactivate user');
      setTimeout(() => setError(''), 3000);
    } finally { setActionLoading(null); }
  };

  const handleRoleUpdated = (updated) => {
    setUsers(u => u.map(x => x.id === updated.id ? updated : x));
    showToast(`Role updated to ${updated.role}`);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter ||
      (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    inactive: users.filter(u => !u.isActive).length,
  };

  const filterStyle = { padding: '7px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', outline: 'none', fontSize: 13 };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#22c55e', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          ✓ {toast}
        </div>
      )}

      {roleModalUser && (
        <RoleModal user={roleModalUser} onClose={() => setRoleModalUser(null)} onUpdated={handleRoleUpdated} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Users</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Manage team members and access control</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.total} color="#4f7ef8" icon="👥" />
        <StatCard label="Active" value={stats.active} color="#22c55e" icon="✅" />
        <StatCard label="Admins" value={stats.admins} color="#f59e0b" icon="🛡️" />
        <StatCard label="Inactive" value={stats.inactive} color="#6b7280" icon="🔒" />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          style={{ ...filterStyle, minWidth: 220 }}
          placeholder="🔍  Search by name, username or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={filterStyle} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select style={filterStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {(search || roleFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}
            style={{ ...filterStyle, cursor: 'pointer', color: 'var(--text3)' }}>✕ Clear</button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text3)', alignSelf: 'center' }}>
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Users grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)' }}>
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 32 }}>👤</div>
          <div>No users match your filters</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map(u => {
            const isCurrentUser = u.id === currentUser?.id;
            const isActive = u.isActive !== false;
            return (
              <div key={u.id} style={{
                background: 'var(--bg2)', border: `1px solid ${isCurrentUser ? 'rgba(79,126,248,0.4)' : 'var(--border)'}`,
                borderRadius: 12, padding: '20px',
                opacity: isActive ? 1 : 0.6,
                position: 'relative',
                transition: 'border-color 0.2s',
              }}>
                {isCurrentUser && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, background: 'rgba(79,126,248,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                    YOU
                  </div>
                )}

                {/* User header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <Avatar name={u.fullName || u.username} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {u.fullName || u.username}
                      {!isActive && <span style={{ fontSize: 10, color: '#6b7280', background: 'rgba(107,114,128,0.15)', padding: '1px 6px', borderRadius: 8 }}>INACTIVE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @{u.username}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[
                    { icon: '✉️', value: u.email },
                    { icon: '🏢', value: u.department || 'No department' },
                  ].map(row => (
                    <div key={row.icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13 }}>{row.icon}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Role badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Badge
                    label={u.role}
                    color={u.role === 'ADMIN' ? '#f59e0b' : '#4f7ef8'}
                  />
                  <Badge
                    label={isActive ? 'ACTIVE' : 'INACTIVE'}
                    color={isActive ? '#22c55e' : '#6b7280'}
                  />
                </div>

                {/* Actions — only for admins, not for self */}
                {isAdmin && !isCurrentUser && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setRoleModalUser(u)}
                      style={{ flex: 1, padding: '7px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--text2)', cursor: 'pointer', fontSize: 12 }}>
                      🛡 Change role
                    </button>
                    {isActive && (
                      <button
                        disabled={actionLoading === u.id}
                        onClick={() => handleDeactivate(u.id, u.username)}
                        style={{ flex: 1, padding: '7px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, color: '#fca5a5', cursor: 'pointer', fontSize: 12 }}>
                        {actionLoading === u.id ? '...' : '🔒 Deactivate'}
                      </button>
                    )}
                  </div>
                )}

                {isCurrentUser && (
                  <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '6px', background: 'var(--bg3)', borderRadius: 7 }}>
                    This is your account
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
