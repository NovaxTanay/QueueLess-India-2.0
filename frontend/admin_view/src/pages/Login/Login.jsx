// ============================================
// Login Page — Admin authentication
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { isValidEmail } from '../../utils/helpers';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const userData = await login(email, password);

      // Check role
      if (userData.role !== 'admin') {
        setError('Please use the User App to login.');
        return;
      }

      // Always land on dashboard — it handles empty state gracefully
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-logo">
            <div className="auth-logo-icon">Q</div>
            <h1 className="auth-logo-text">QueueLess</h1>
            <p className="auth-logo-sub">Admin Panel</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to manage your queues</p>

            {error && <div className="error-message">{error}</div>}

            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-signin-btn"
            disabled={loading}
            onClick={async () => {
              try {
                const userData = await signInWithGoogle();
                if (userData.role !== 'admin') {
                  setError('Please use the User App to login.');
                  return;
                }
                navigate('/dashboard');
              } catch (err) {
                setError(err.message || 'Google sign-in failed. Please try again.');
              }
            }}
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
          </div>

          <div className="auth-switch-link">
            Not an admin?
            <button onClick={() => window.open(import.meta.env.VITE_USER_URL || 'http://localhost:5173', '_blank')}>
              Go to User App →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
