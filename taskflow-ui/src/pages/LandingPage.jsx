import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Tiny reusable components ─────────────────────────────────────

function NavBar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 40px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(15,17,23,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>TaskFlow</span>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <a href="#features" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 14 }}>Features</a>
        <a href="#how-it-works" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 14 }}>How it works</a>
        <button onClick={onLogin} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}>
          Sign in
        </button>
        <button onClick={onSignup} style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          Get started
        </button>
      </div>
    </nav>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '28px 26px',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

function StatBadge({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── Mock dashboard preview ────────────────────────────────────────
function DashboardPreview() {
  const bars = [
    { label: 'OPEN', val: 70, color: '#4f7ef8' },
    { label: 'IN PROGRESS', val: 45, color: '#f59e0b' },
    { label: 'RESOLVED', val: 85, color: '#22c55e' },
    { label: 'CRITICAL', val: 30, color: '#ef4444' },
  ];
  const tasks = [
    { title: 'Auth service failing under load', type: 'INCIDENT', priority: 'CRITICAL', color: '#ef4444' },
    { title: 'Implement JWT refresh tokens', type: 'FEATURE', priority: 'HIGH', color: '#f59e0b' },
    { title: 'Optimize DB query for task list', type: 'BUG', priority: 'MEDIUM', color: '#4f7ef8' },
  ];
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      transform: 'perspective(1000px) rotateX(4deg) rotateY(-4deg)',
    }}>
      {/* Fake titlebar */}
      <div style={{ background: 'var(--bg3)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border)' }}>
        {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text3)' }}>TaskFlow — Dashboard</span>
      </div>
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Stat cards */}
        {[['24', 'Total Tasks', '#4f7ef8'], ['3', 'Critical', '#ef4444'], ['8', 'Overdue', '#f59e0b'], ['14', 'Resolved', '#22c55e']].map(([v, l, c]) => (
          <div key={l} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', borderLeft: `2px solid ${c}` }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>BY STATUS</div>
        {bars.map(b => (
          <div key={b.label} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>
              <span>{b.label}</span><span>{b.val}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${b.val}%`, background: b.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Mini task list */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>RECENT TASKS</div>
        {tasks.map(t => (
          <div key={t.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 6, background: `${t.color}22`, color: t.color, marginLeft: 6, flexShrink: 0 }}>{t.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  const features = [
    { icon: '🔐', color: '#4f7ef8', title: 'JWT Authentication', desc: 'Stateless token-based auth with role-based access control. ADMIN and USER roles with fine-grained endpoint permissions.' },
    { icon: '📋', color: '#22c55e', title: 'Task & Incident Management', desc: 'Full lifecycle management from OPEN to CLOSED. Support for tasks, bugs, incidents, and feature requests.' },
    { icon: '📊', color: '#f59e0b', title: 'Live Dashboard', desc: 'Real-time aggregated statistics — task counts by status, priority, type, and assignee workload.' },
    { icon: '📜', color: '#06b6d4', title: 'Full Audit Trail', desc: 'Every field change is automatically recorded with who changed it, what changed, and when.' },
    { icon: '🔍', color: '#8b5cf6', title: 'Smart Filtering', desc: 'Search, filter by status/priority/type/assignee, and paginate — powered by JPA Specification pattern.' },
    { icon: '🐳', color: '#ef4444', title: 'Docker Ready', desc: 'Full stack containerized with Docker Compose. One command to launch the API, UI, and database together.' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <NavBar
        onLogin={() => navigate('/login')}
        onSignup={() => navigate('/signup')}
      />

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 40px 40px', maxWidth: 1200, margin: '0 auto', gap: 60 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(79,126,248,0.12)', border: '1px solid rgba(79,126,248,0.3)', borderRadius: 20, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f7ef8', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#4f7ef8', fontWeight: 500 }}>Production-grade Spring Boot API</span>
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.12, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Manage Tasks &{' '}
            <span style={{ background: 'linear-gradient(135deg, #4f7ef8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Incidents
            </span>
            <br />Like a Pro
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            A full-stack enterprise task management system built with Spring Boot 3, JWT authentication, PostgreSQL, and React. Designed to showcase production backend patterns.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={() => navigate('/signup')} style={{ padding: '14px 28px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Get started free <span>→</span>
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 28px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text)', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
              Sign in
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <StatBadge value="15+" label="API endpoints" />
            <StatBadge value="JWT" label="Auth" />
            <StatBadge value="3" label="Docker services" />
            <StatBadge value="CI/CD" label="GitHub Actions" />
          </div>
        </div>

        {/* Hero visual */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Features</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 14 }}>Everything you need</h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 480, margin: '0 auto' }}>
            Built with enterprise Java patterns to demonstrate real-world backend development skills.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '80px 40px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>Up and running in minutes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <StepCard number="1" title="Create your account" desc="Sign up with your name, email, and a secure password. Your account is created instantly with USER role access." />
            <div style={{ width: 2, height: 20, background: 'var(--border)', margin: '0 17px' }} />
            <StepCard number="2" title="Create and assign tasks" desc="Add tasks, bugs, incidents, or feature requests. Set priority, due dates, assignees, and tags to keep everything organized." />
            <div style={{ width: 2, height: 20, background: 'var(--border)', margin: '0 17px' }} />
            <StepCard number="3" title="Track progress in real time" desc="Move tasks through the status pipeline. Every change is logged to an immutable audit trail automatically." />
            <div style={{ width: 2, height: 20, background: 'var(--border)', margin: '0 17px' }} />
            <StepCard number="4" title="Collaborate with comments" desc="Leave threaded comments on tasks. Your team sees updates in real time on the dashboard." />
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tech Stack</div>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Built with modern tools</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          {[
            ['☕ Java 17', '#f59e0b'],
            ['🌿 Spring Boot 3', '#22c55e'],
            ['🔐 Spring Security', '#4f7ef8'],
            ['🗄️ PostgreSQL', '#06b6d4'],
            ['🏗️ JPA / Hibernate', '#8b5cf6'],
            ['⚛️ React 18', '#06b6d4'],
            ['🐳 Docker', '#4f7ef8'],
            ['📋 OpenAPI 3', '#22c55e'],
            ['🔑 JWT', '#f59e0b'],
            ['⚙️ GitHub Actions', '#6b7280'],
          ].map(([label, color]) => (
            <div key={label} style={{ padding: '8px 18px', background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 20, fontSize: 13, color, fontWeight: 500 }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 36, lineHeight: 1.7 }}>
            Create a free account and explore the full task management system. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{ padding: '14px 32px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Create free account →
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 28px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text)', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text3)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
          <span style={{ fontWeight: 500, color: 'var(--text2)' }}>TaskFlow</span>
        </div>
        <div>Built with Spring Boot 3 · React 18 · PostgreSQL · Docker</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: 'var(--text3)', textDecoration: 'none' }}>API Docs</a>
          <a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Health</a>
        </div>
      </footer>
    </div>
  );
}
