import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(redirect || '/');
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel — Impact */}
        <div className="auth-illustration">
          <div className="auth-brand">
            <div className="auth-brand-logo">Q</div>
            <span className="auth-brand-text">
              Queue<span className="auth-brand-accent">Less</span>
            </span>
          </div>

          <div className="auth-impact">
            <div className="auth-impact-number">2.5 Billion</div>
            <div className="auth-impact-text">
              hours wasted in queues<br />across India every year.
            </div>
          </div>

          <div className="auth-trust-pills">
            <span className="auth-pill">🏥 Hospitals</span>
            <span className="auth-pill">🏦 Banks</span>
            <span className="auth-pill">🏛️ Govt Offices</span>
          </div>

          {/* Queue visualization bars */}
          <div className="auth-queue-viz">
            <div className="auth-queue-bar" style={{ width: '85%' }} />
            <div className="auth-queue-bar" style={{ width: '65%' }} />
            <div className="auth-queue-bar" style={{ width: '45%' }} />
            <div className="auth-queue-bar" style={{ width: '25%' }} />
          </div>

          <p className="auth-tagline">
            Join thousands saving time daily
          </p>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-form-section">
          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your QueueLess account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-signin-btn"
              disabled={loading}
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  navigate(redirect || '/');
                } catch {
                  // error is set in context
                }
              }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="auth-trust-text">
              Trusted across hospitals, banks &amp; government offices
            </p>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Create one</Link>
          </div>

          <div className="auth-switch-link">
            Are you a service admin?
            <button onClick={() => window.open('http://localhost:5176', '_blank')}>
              Admin Panel →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
