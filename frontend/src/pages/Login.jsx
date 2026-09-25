import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('member'); // 'member' or 'admin'
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleRoleSelect = (role) => {
    setRoleMode(role);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const validate = () => {
    const inputVal = email.trim();
    if (!inputVal) {
      return roleMode === 'member'
        ? 'Please enter your registered email address or phone number.'
        : 'Admin email address is required.';
    }

    if (roleMode === 'admin') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(inputVal)) {
        return 'Please enter a valid administrator email address.';
      }
    }

    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password, roleMode);
      navigate('/');
    } catch (err) {
      setError(
        err.message ||
          (roleMode === 'admin'
            ? 'Invalid admin credentials. Only authorized gym administrator can log in.'
            : 'Invalid credentials. Please verify your member email/phone and password.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="vh-100 w-100 d-flex align-items-center justify-content-center p-2 p-sm-3 position-relative overflow-hidden"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(34, 197, 94, 0.09) 0%, transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(59, 130, 246, 0.08) 0%, transparent 45%),
          linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%)
        `
      }}
    >
      <div
        className="card border-0 shadow rounded-4 overflow-hidden position-relative animate-fade-in bg-white"
        style={{
          maxWidth: '430px',
          width: '100%',
          boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            height: '4px',
            background:
              roleMode === 'admin'
                ? 'linear-gradient(90deg, #1e293b, #0f172a, #334155)'
                : 'linear-gradient(90deg, #16a34a, #22c55e, #10b981)'
          }}
        />

        <div className="px-4 py-3.5 px-sm-4 py-sm-4">
          {/* Brand Logo & Header */}
          <div className="text-center mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2 shadow-sm"
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: roleMode === 'admin' ? '#f1f5f9' : '#dcfce7',
                border: roleMode === 'admin' ? '1px solid #cbd5e1' : '1px solid #bbf7d0'
              }}
            >
              {roleMode === 'admin' ? (
                <i className="bi bi-shield-lock-fill text-dark fs-4"></i>
              ) : (
                <i className="bi bi-lightning-charge-fill text-success fs-4"></i>
              )}
            </div>

            <div
              className="fs-4 fw-bold text-dark mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
            >
              Hulk<span className="text-success">Fitness</span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
              {roleMode === 'admin'
                ? 'Restricted portal for gym owner & administrator'
                : 'Welcome! Sign in to access your gym member account'}
            </p>
          </div>

          {/* Clean Role Switcher Tabs */}
          <div
            className="p-1 rounded-3 d-flex gap-1 mb-2.5"
            style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
          >
            <button
              type="button"
              onClick={() => handleRoleSelect('member')}
              className={`btn btn-sm flex-fill py-1.5 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                roleMode === 'member'
                  ? 'btn-success text-white shadow-sm'
                  : 'btn-transparent text-secondary'
              }`}
              style={{ fontSize: '0.82rem' }}
            >
              <i className="bi bi-person-fill"></i>
              <span>Gym Member</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`btn btn-sm flex-fill py-1.5 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 transition-all ${
                roleMode === 'admin'
                  ? 'btn-dark text-white shadow-sm'
                  : 'btn-transparent text-secondary'
              }`}
              style={{ fontSize: '0.82rem' }}
            >
              <i className="bi bi-shield-lock-fill"></i>
              <span>Admin / Owner</span>
            </button>
          </div>

          {/* Context Notice Banner */}
          {roleMode === 'admin' ? (
            <div
              className="alert py-1.5 px-3 small rounded-3 d-flex align-items-center gap-2 mb-2.5 border text-secondary"
              style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', fontSize: '0.78rem' }}
            >
              <i className="bi bi-shield-lock text-warning fs-6 flex-shrink-0"></i>
              <span>
                <strong>Admin Portal:</strong> Restricted to Gym Owner (Maitra Sojitra).
              </span>
            </div>
          ) : (
            <div
              className="alert py-1.5 px-3 small rounded-3 d-flex align-items-center gap-2 mb-2.5 border text-secondary"
              style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', fontSize: '0.78rem' }}
            >
              <i className="bi bi-check-circle-fill text-success fs-6 flex-shrink-0"></i>
              <span>
                All registered gym members can log in using their email or phone.
              </span>
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger py-1.5 px-3 small rounded-3 d-flex align-items-center gap-2 mb-2.5 border"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', fontSize: '0.8rem' }}
              role="alert"
            >
              <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-2.5">
              <label className="form-label small fw-semibold text-secondary mb-1" style={{ fontSize: '0.8rem' }}>
                {roleMode === 'admin' ? 'Admin Email (Owner)' : 'Email Address or Phone'}
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type={roleMode === 'admin' ? 'email' : 'text'}
                  className="form-control bg-white py-2 ps-5 pe-3 rounded-3"
                  style={{
                    fontSize: '0.88rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    roleMode === 'admin' ? 'sojitramaitra5@gmail.com' : 'e.g. member@email.com or 9876543210'
                  }
                  autoComplete={roleMode === 'admin' ? 'email' : 'username'}
                />
              </div>
            </div>

            <div className="mb-2.5">
              <label className="form-label small fw-semibold text-secondary mb-1" style={{ fontSize: '0.8rem' }}>
                <span>Password</span>
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-white py-2 ps-5 pe-5 rounded-3"
                  style={{
                    fontSize: '0.88rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted text-decoration-none p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 small">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-secondary" htmlFor="rememberMe" style={{ fontSize: '0.82rem' }}>
                  Remember me
                </label>
              </div>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-shield-check text-success me-1"></i>256-bit Secure
              </span>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 fw-bold rounded-3 shadow-sm text-white d-flex align-items-center justify-content-center gap-2"
              style={{
                fontSize: '0.92rem',
                letterSpacing: '0.01em',
                background:
                  roleMode === 'admin'
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                border: 'none'
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>{roleMode === 'admin' ? 'Sign In as Admin' : 'Sign In as Member'}</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center mt-3 pt-2.5 border-top border-light-subtle small">
            {roleMode === 'member' ? (
              <>
                <span className="text-secondary me-1.5" style={{ fontSize: '0.82rem' }}>New to Hulk Fitness?</span>
                <Link to="/register" className="fw-semibold text-decoration-none text-success" style={{ fontSize: '0.82rem' }}>
                  Register as a Member
                </Link>
              </>
            ) : (
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Authorized Gym Administration System
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
