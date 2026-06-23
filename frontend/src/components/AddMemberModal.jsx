import { useState } from 'react';
import { searchUserApi } from '../api/auth.api.js';
import { addMemberApi } from '../api/project.api.js';

export default function AddMemberModal({ projectId, onClose, onMemberAdded }) {
  const [email, setEmail]       = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError]       = useState('');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding]     = useState(false);
  const [success, setSuccess]   = useState('');

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setError('');
    setFoundUser(null);
    setSuccess('');
    try {
      const res = await searchUserApi(email.trim());
      setFoundUser(res.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!foundUser) return;
    setAdding(true);
    setError('');
    try {
      const res = await addMemberApi(projectId, foundUser._id);
      setSuccess(`${foundUser.name} added successfully!`);
      setFoundUser(null);
      setEmail('');
      onMemberAdded(res.data.data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Add Team Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Enter member's email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !email.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Found User Card */}
        {foundUser && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-sm font-bold text-white">
                {foundUser.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{foundUser.name}</p>
                <p className="text-xs text-gray-400">{foundUser.email}</p>
                <span className="text-xs text-teal-400 capitalize">{foundUser.role}</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            >
              {adding ? 'Adding...' : '+ Add'}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}