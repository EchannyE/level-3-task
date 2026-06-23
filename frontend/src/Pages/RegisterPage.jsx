import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth.api.js';
import useAuthStore from '../store/authStore.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerApi(form);
      setAuth(res.data.data.user, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
        <p className="text-gray-400 text-sm mb-8">Join CollabBoard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe' },
            { name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com' },
            { name: 'password', type: 'password', label: 'Password', placeholder: '••••••••' },
          ].map(({ name, type, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
              <input
                name={name} type={type} value={form[name]}
                onChange={handleChange} placeholder={placeholder} required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}