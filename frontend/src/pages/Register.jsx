import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    if (!name.trim()) {
      return 'Please enter your full name.';
    }
    if (!email.trim()) {
      return 'Please enter your email address.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      return 'Please enter your 10-digit phone number.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
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
      await register(name.trim(), email.trim(), password, phone.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(circle at 15% 15%, rgba(34, 197, 94, 0.09) 0%, transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.08) 0%, transparent 45%),
          linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%)
        `
      }}
    >
      <div
        className="card border-0 shadow rounded-4 overflow-hidden position-relative animate-fade-in bg-white"
        style={{
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Top vibrant accent stripe */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #16a34a, #22c55e, #10b981)'
          }}
        />

        <div className="p-4 p-sm-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0'
              }}
            >
              <i className="bi bi-person-plus-fill text-success fs-3"></i>
            </div>

            <div
              className="fs-3 fw-bold text-dark mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
            >
              Hulk<span className="text-success">Fitness</span>
            </div>
            <p className="text-secondary small mb-0">
              Join Hulk Fitness & create your member portal account
            </p>
          </div>

          <div
            className="alert py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3 border text-secondary"
            style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
          >
            <i className="bi bi-info-circle-fill text-success flex-shrink-0"></i>
            <span style={{ fontSize: '0.8rem' }}>
              Gym Member Registration: Access gym equipment, membership plans & supplements.
            </span>
          </div>

          {error && (
            <div
              className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3 border"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
              role="alert"
            >
              <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Full Name
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-person position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type="text"
                  className="form-control bg-white py-2.5 ps-5 pe-3 rounded-3"
                  style={{
                    fontSize: '0.9rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Email Address
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-envelope position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type="email"
                  className="form-control bg-white py-2.5 ps-5 pe-3 rounded-3"
                  style={{
                    fontSize: '0.9rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Phone Number
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-telephone position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type="tel"
                  className="form-control bg-white py-2.5 ps-5 pe-3 rounded-3"
                  style={{
                    fontSize: '0.9rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="9876543210"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Password
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-white py-2.5 ps-5 pe-5 rounded-3"
                  style={{
                    fontSize: '0.9rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
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

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Confirm Password
              </label>
              <div className="position-relative">
                <i
                  className="bi bi-shield-check position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                  style={{ pointerEvents: 'none' }}
                ></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-white py-2.5 ps-5 pe-3 rounded-3"
                  style={{
                    fontSize: '0.9rem',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a'
                  }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 py-2.5 fw-bold rounded-3 shadow-sm text-white d-flex align-items-center justify-content-center gap-2"
              style={{
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                border: 'none'
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Registering Member...</span>
                </>
              ) : (
                <>
                  <span>Create Member Account</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top border-light-subtle small">
            <span className="text-secondary me-1.5">Already a gym member?</span>
            <Link to="/login" className="fw-semibold text-decoration-none text-success">
              Sign In to Member Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
