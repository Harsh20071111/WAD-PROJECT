import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN')    navigate('/admin/dashboard');
      else if (user.role === 'RESIDENT') navigate('/resident/dashboard');
      else navigate('/staff/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      ADMIN:    { email: 'admin@pgmanage.com', password: 'Admin@1234' },
      RESIDENT: { email: 'priya@resident.com',  password: 'Resident@1234' },
      STAFF:    { email: 'ravi@sunrise.pg',     password: 'Staff@1234' },
    };
    setForm(creds[role]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center">
            <Icon name="apartment" size={22} className="text-on-primary" />
          </div>
          <div>
            <span className="font-headline font-bold text-xl text-on-primary">NestOps</span>
            <p className="text-on-primary/70 text-label-sm">PG Management Platform</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="font-headline font-bold text-4xl text-on-primary leading-tight">
            Manage your PG<br />with confidence.
          </h1>
          <p className="text-on-primary/80 text-body-lg max-w-sm">
            Track rooms, collect rent, manage service requests and keep residents happy — all from one place.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: 'bed', text: 'Real-time room & bed occupancy matrix' },
              { icon: 'currency_rupee', text: 'Automated rent collection & receipts' },
              { icon: 'build', text: 'Service request tracking with SLAs' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-on-primary/10 flex items-center justify-center">
                  <Icon name={f.icon} size={16} className="text-on-primary" />
                </div>
                <span className="text-on-primary/90 text-body-md">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-on-primary/40 text-label-sm">© 2026 NestOps. All rights reserved.</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="apartment" size={20} className="text-on-primary" />
            </div>
            <span className="font-headline font-bold text-xl text-primary">NestOps</span>
          </div>

          <div>
            <h2 className="font-headline font-bold text-headline-xl text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant text-body-md mt-1">Sign in to your PG Management account</p>
          </div>

          {/* Demo login buttons */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 space-y-2">
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Demo Accounts</p>
            <div className="flex flex-wrap gap-2">
              {['ADMIN', 'RESIDENT', 'STAFF'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant text-label-md text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">
                <Icon name="error" size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Icon name="mail" size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Icon name="lock" size={16} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
                >
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="login" size={18} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-body-sm text-on-surface-variant">
            Only an administrator can create resident accounts.{' '}
            <Link to="/contact" className="text-primary font-semibold hover:underline">Contact admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
