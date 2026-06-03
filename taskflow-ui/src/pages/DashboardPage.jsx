import React, { useEffect, useState } from 'react';
import { tasksApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  OPEN: '#4f7ef8', IN_PROGRESS: '#f59e0b', UNDER_REVIEW: '#06b6d4',
  RESOLVED: '#22c55e', CLOSED: '#6b7280',
  LOW: '#22c55e', MEDIUM: '#4f7ef8', HIGH: '#f59e0b', CRITICAL: '#ef4444',
};

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 22px',
      borderLeft: `3px solid ${color || 'var(--accent)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{value ?? '—'}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 28, opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  );
}

function BarChart({ data, colors, title }) {
  if (!data || !Object.keys(data).length) return null;
  const max = Math.max(...Object.values(data), 1);
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)' }}>{title}</div>
      {Object.entries(data).map(([key, val]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{key}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{val}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(val / max) * 100}%`,
              background: colors?.[key] || 'var(--accent)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    tasksApi.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text3)' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Real-time overview of tasks and incidents</p>
      </div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={stats?.totalTasks} icon="📋" color="#4f7ef8" />
        <StatCard label="Open" value={stats?.openItems} icon="🔵" color="#4f7ef8" sub="Needs attention" />
        <StatCard label="In Progress" value={stats?.inProgressItems} icon="🟡" color="#f59e0b" />
        <StatCard label="Resolved" value={stats?.resolvedItems} icon="🟢" color="#22c55e" />
        <StatCard label="Overdue" value={stats?.overdueItems} icon="🔴" color="#ef4444" sub="Past due date" />
        <StatCard label="Critical" value={stats?.criticalItems} icon="⚠️" color="#ef4444" sub="High priority" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        <BarChart data={stats?.byStatus} colors={COLORS} title="By Status" />
        <BarChart data={stats?.byPriority} colors={COLORS} title="By Priority" />
        <BarChart data={stats?.byType} title="By Type" />
      </div>

      {/* Assignee workload */}
      {stats?.assigneeWorkload && Object.keys(stats.assigneeWorkload).length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Assignee Workload (open tasks)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(stats.assigneeWorkload).map(([user, count]) => (
              <div key={user} style={{
                background: 'var(--bg3)', borderRadius: 20, padding: '6px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: '#fff',
                }}>{user[0].toUpperCase()}</div>
                <span style={{ fontSize: 13 }}>{user}</span>
                <span style={{
                  background: 'var(--accent)', color: '#fff', borderRadius: 10,
                  padding: '1px 8px', fontSize: 11, fontWeight: 600,
                }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button onClick={() => navigate('/app/tasks')} style={{
          padding: '10px 20px', background: 'var(--accent)', border: 'none',
          borderRadius: 8, color: '#fff', fontWeight: 500, cursor: 'pointer',
        }}>View all tasks →</button>
        <button onClick={() => navigate('/app/tasks?new=1')} style={{
          padding: '10px 20px', background: 'var(--bg2)',
          border: '1px solid var(--border2)', borderRadius: 8,
          color: 'var(--text)', cursor: 'pointer',
        }}>+ Create task</button>
      </div>
    </div>
  );
}
