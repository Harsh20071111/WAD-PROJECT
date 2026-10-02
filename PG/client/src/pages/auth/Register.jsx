import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-7">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Create an admin account</h1>
          <p className="text-on-surface-variant text-body-md mt-1">Register your PG management account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}
          {[
            ['name', 'Full name', 'text'],
            ['email', 'Email address', 'email'],
            ['phone', 'Phone number (optional)', 'tel'],
            ['password', 'Password', 'password'],
          ].map(([name, label, type]) => (
            <label key={name} className="block label">
              {label}
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                className="input mt-1"
                required={name !== 'phone'}
                minLength={name === 'password' ? 6 : undefined}
              />
            </label>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-body-sm text-on-surface-variant">
          Already registered? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
