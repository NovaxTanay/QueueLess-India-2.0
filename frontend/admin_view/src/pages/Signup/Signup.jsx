// ============================================
// Signup Page — Admin registration
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import '../Login/Login.css';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signup(name, email, password, role);

      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        setError('Account created! Please download the User App to continue.');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-logo">
            <div className="auth-logo-icon">Q</div>
            <h1 className="auth-logo-text">QueueLess</h1>
            <p className="auth-logo-sub">Create your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="auth-field">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>I am a...</label>
              <div className="auth-roles">
                <div
                  className={`auth-role-card ${role === 'user' ? 'auth-role-selected' : ''}`}
                  onClick={() => setRole('user')}
                >
                  <div className="auth-role-icon">👤</div>
                  <div className="auth-role-label">User</div>
                  <div className="auth-role-desc">Join queues</div>
                </div>
                <div
                  className={`auth-role-card ${role === 'admin' ? 'auth-role-selected' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <div className="auth-role-icon">🏢</div>
                  <div className="auth-role-label">Service Provider</div>
                  <div className="auth-role-desc">Manage queues</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>

          <div className="auth-switch-link">
            Not an admin?
            <button onClick={() => window.open('http://localhost:5173', '_blank')}>
              Go to User App →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
