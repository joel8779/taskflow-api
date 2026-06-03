import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const s = {
  shell:   { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: { width: 220, minWidth: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
  logo:    { padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon:{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoText:{ fontWeight: 600, fontSize: 15, color: 'var(--text)' },
  nav:     { flex: 1, padding: '12px' },
  section: { fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 8px 4px' },
  main:    { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
  topbar:  { height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--bg2)', flexShrink: 0 },
  content: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
};

const navItem = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '8px 10px', borderRadius: 6, marginBottom: 2,
  color: isActive ? 'var(--text)' : 'var(--text2)',
  background: isActive ? 'var(--bg3)' : 'transparent',
  fontWeight: isActive ? 500 : 400,
  textDecoration: 'none', fontSize: 14,
  transition: 'all 0.12s',
});

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          <span style={s.logoText}>TaskFlow</span>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          <div style={s.section}>Main</div>
          <NavLink to="/app" end style={({ isActive }) => navItem(isActive)}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/app/tasks" style={({ isActive }) => navItem(isActive)}>
            <span>📋</span> Tasks
          </NavLink>

          {isAdmin && (
            <>
              <div style={{ ...s.section, marginTop: 14 }}>Admin</div>
              <NavLink to="/app/users" style={({ isActive }) => navItem(isActive)}>
                <span>👥</span> Users
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName || user?.username}</div>
              <div style={{ fontSize: 11, color: 'var(--accent)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/landing'); }} style={{ width: '100%', padding: '7px', borderRadius: 6, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ fontWeight: 500, fontSize: 15 }}>TaskFlow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>{initials}</div>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.username}</span>
          </div>
        </div>
        <div style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
