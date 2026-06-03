import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Validation rules ─────────────────────────────────────────────

const validators = {
  fullName: (v) => {
    if (!v.trim()) return 'Full name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    if (v.trim().length > 100) return 'Name cannot exceed 100 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return '';
  },
  username: (v) => {
    if (!v.trim()) return 'Username is required';
    if (v.length < 3) return 'Username must be at least 3 characters';
    if (v.length > 50) return 'Username cannot exceed 50 characters';
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) return 'Username can only contain letters, numbers, dots, underscores, hyphens';
    if (/^[._-]/.test(v)) return 'Username cannot start with a special character';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },
  department: (v) => {
    if (v && v.length > 20) return 'Department cannot exceed 20 characters';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (v.length > 72) return 'Password is too long';
    if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(v)) return 'Password must contain at least one number';
    return '';
  },
  confirmPassword: (v, password) => {
    if (!v) return 'Please confirm your password';
    if (v !== password) return 'Passwords do not match';
    return '';
  },
};

// ── Password strength meter ──────────────────────────────────────

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Very weak', color: '#ef4444' };
  if (score === 2) return { score, label: 'Weak', color: '#f59e0b' };
  if (score === 3) return { score, label: 'Fair', color: '#eab308' };
  if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very strong', color: '#10b981' };
}

function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: -8, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : 'var(--bg3)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Field component ──────────────────────────────────────────────

function Field({ label, error, touched, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: touched && error ? '#fca5a5' : 'var(--text2)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {touched && error && (
        <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

// ── Main Signup Page ─────────────────────────────────────────────

export default function SignupPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', username: '', email: '',
    department: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validate a single field
  const validateField = (name, value) => {
    if (name === 'confirmPassword') return validators.confirmPassword(value, form.password);
    return validators[name] ? validators[name](value) : '';
  };

  // Handle input change + live validation if touched
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
      // Re-validate confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: validators.confirmPassword(form.confirmPassword, value) }));
      }
    }
  };

  // Mark field as touched on blur, trigger validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  // Validate all fields before submit
  const validateAll = () => {
    const fields = ['fullName', 'username', 'email', 'department', 'password', 'confirmPassword'];
    const newErrors = {};
    const allTouched = {};
    fields.forEach(f => {
      allTouched[f] = true;
      newErrors[f] = f === 'confirmPassword'
        ? validators.confirmPassword(form.confirmPassword, form.password)
        : validators[f] ? validators[f](form[f]) : '';
    });
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) return;
    if (!agreeTerms) {
      setServerError('Please agree to the terms to continue');
      return;
    }

    const result = await register({
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      department: form.department.trim() || undefined,
    });

    if (result.success) {
      navigate('/app');
    } else {
      setServerError(result.message);
    }
  };

  const inp = (name) => ({
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg3)',
    border: `1px solid ${touched[name] && errors[name] ? 'rgba(239,68,68,0.6)' : touched[name] && !errors[name] ? 'rgba(34,197,94,0.5)' : 'var(--border2)'}`,
    borderRadius: 8,
    color: 'var(--text)',
    outline: 'none',
    fontSize: 14,
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  const passwordInp = (name) => ({
    ...inp(name),
    paddingRight: 44,
  });

  const strength = getStrength(form.password);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left panel — branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f1117 0%, #161b27 50%, #1a2035 100%)', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--border)', minWidth: 0 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>TaskFlow</span>
        </div>

        {/* Quote */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 20, maxWidth: 380 }}>
            "The best way to manage work is to <span style={{ color: 'var(--accent)' }}>track it properly</span>."
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '✅', text: 'Full task lifecycle management' },
              { icon: '🔐', text: 'Secure JWT authentication' },
              { icon: '📊', text: 'Real-time dashboard analytics' },
              { icon: '📜', text: 'Complete audit trail history' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Join TaskFlow · Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <Field label="Full name *" error={errors.fullName} touched={touched.fullName}>
              <input
                name="fullName" type="text"
                value={form.fullName}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="Alice Johnson"
                style={inp('fullName')}
                autoComplete="name"
              />
            </Field>

            {/* Username + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Username *" error={errors.username} touched={touched.username} hint="Letters, numbers, dots, _-">
                <input
                  name="username" type="text"
                  value={form.username}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="alice.j"
                  style={inp('username')}
                  autoComplete="username"
                />
              </Field>
              <Field label="Department" error={errors.department} touched={touched.department} hint="Optional">
                <input
                  name="department" type="text"
                  value={form.department}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Engineering"
                  style={inp('department')}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email address *" error={errors.email} touched={touched.email}>
              <input
                name="email" type="email"
                value={form.email}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="alice@company.com"
                style={inp('email')}
                autoComplete="email"
              />
            </Field>

            {/* Password */}
            <Field label="Password *" error={errors.password} touched={touched.password} hint="Min 8 chars, one uppercase, one number">
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Create a strong password"
                  style={passwordInp('password')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </Field>
            <PasswordStrength password={form.password} />

            {/* Confirm Password */}
            <Field label="Confirm password *" error={errors.confirmPassword} touched={touched.confirmPassword}>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Repeat your password"
                  style={passwordInp('confirmPassword')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </Field>

            {/* Match indicator */}
            {form.confirmPassword && form.password && (
              <div style={{ fontSize: 11, marginTop: -10, marginBottom: 16, color: form.confirmPassword === form.password ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ color: 'var(--accent)' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: 'var(--accent)' }}>Privacy Policy</span>
              </span>
            </label>

            {/* Progress indicator */}
            <div style={{ marginBottom: 20 }}>
              {(() => {
                const fields = ['fullName', 'username', 'email', 'password', 'confirmPassword'];
                const filled = fields.filter(f => form[f] && !errors[f]).length;
                const pct = Math.round((filled / fields.length) * 100);
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                      <span>Form completion</span><span>{pct}%</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: 'var(--accent)',
              border: 'none', borderRadius: 9, color: '#fff',
              fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 24 }}>
            By creating an account you accept our terms of service. This is a demo application.
          </p>
        </div>
      </div>
    </div>
  );
}
