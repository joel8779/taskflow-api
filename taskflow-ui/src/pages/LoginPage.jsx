import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = (name, value) => {
    if (name === 'usernameOrEmail' && !value.trim()) return 'Username or email is required';
    if (name === 'password' && !value) return 'Password is required';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    // Touch all
    const allTouched = { usernameOrEmail: true, password: true };
    const allErrors = { usernameOrEmail: validate('usernameOrEmail', form.usernameOrEmail), password: validate('password', form.password) };
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    const result = await login(form);
    if (result.success) navigate('/app');
    else setServerError(result.message);
  };

  const inp = (name) => ({
    width: '100%', padding: '10px 14px',
    background: 'var(--bg3)',
    border: `1px solid ${touched[name] && errors[name] ? 'rgba(239,68,68,0.6)' : touched[name] && !errors[name] ? 'rgba(34,197,94,0.4)' : 'var(--border2)'}`,
    borderRadius: 8, color: 'var(--text)', outline: 'none',
    marginBottom: touched[name] && errors[name] ? 4 : 16,
    fontSize: 14, boxSizing: 'border-box', transition: 'border-color 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 20 }}>TaskFlow</span>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28 }}>
            Sign in to your account · {' '}
            <Link to="/signup" style={{ color: 'var(--accent)' }}>Create one</Link>
          </p>

          {serverError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>
              Username or email
            </label>
            <input
              name="usernameOrEmail" type="text"
              value={form.usernameOrEmail}
              onChange={handleChange} onBlur={handleBlur}
              placeholder="admin or admin@taskflow.com"
              style={inp('usernameOrEmail')}
              autoComplete="username"
            />
            {touched.usernameOrEmail && errors.usernameOrEmail && (
              <div style={{ fontSize: 11, color: '#fca5a5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.usernameOrEmail}</div>
            )}

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="••••••••"
                style={{ ...inp('password'), paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 12, top: touched.password && errors.password ? '30%' : '38%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {touched.password && errors.password && (
              <div style={{ fontSize: 11, color: '#fca5a5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {errors.password}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: 'var(--accent)',
              border: 'none', borderRadius: 9, color: '#fff',
              fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 8,
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{ marginTop: 22, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text3)' }}>
            <strong style={{ color: 'var(--text2)' }}>Demo credentials</strong><br />
            Admin: <code style={{ color: 'var(--accent)' }}>admin</code> / <code style={{ color: 'var(--accent)' }}>admin123</code><br />
            User: <code style={{ color: 'var(--accent)' }}>alice.johnson</code> / <code style={{ color: 'var(--accent)' }}>user123</code>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
          <Link to="/landing" style={{ color: 'var(--text3)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
