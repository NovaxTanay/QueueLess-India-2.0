import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import '../Login/Login.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [localError, setLocalError] = useState('');
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(name, email, password, role);
      navigate(role === 'admin' ? '/admin/register' : '/');
    } catch {
      // error is set in context
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-illustration">
          <div className="auth-illustration-icon">✨</div>
          <h2 className="auth-illustration-title">
            Join QueueLess
          </h2>
          <p className="auth-illustration-subtitle">
            Create your account and start booking slots across hospitals, banks, government offices & more.
          </p>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-header">
            <h1>Create Account</h1>
            <p>Get started with QueueLess India</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {displayError && <div className="auth-error">{displayError}</div>}

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
              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Account Type</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className={`notif-tab ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                  style={{ flex: 1 }}
                >
                  👤 User
                </button>
                <button
                  type="button"
                  className={`notif-tab ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                  style={{ flex: 1 }}
                >
                  🏢 Admin
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>

          <div className="auth-switch-link">
            Are you a service admin?
            <button onClick={() => window.open(import.meta.env.VITE_ADMIN_URL || 'https://queue-less-india-2-0.vercel.app/', '_blank')}>
              Admin Panel →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
