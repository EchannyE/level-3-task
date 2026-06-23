import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjectsApi, createProjectApi, deleteProjectApi } from '../api/project.api.js';
import useProjectStore from '../store/projectStore.js';
import useAuthStore from '../store/authStore.js';
import NotificationBell from '../components/NotificationBell.jsx';

export default function DashboardPage() {
  const { projects, setProjects } = useProjectStore();
  const { user, logout }          = useAuthStore();
  const navigate                  = useNavigate();

  const [showCreate, setShowCreate]     = useState(false);
  const [form, setForm]                 = useState({ name: '', description: '' });
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState(null); // project being confirmed
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    getProjectsApi()
      .then((res) => setProjects(res.data.data.projects))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await createProjectApi(form);
      setProjects([res.data.data.project, ...projects]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (projectId) => {
    setDeleteLoading(true);
    try {
      await deleteProjectApi(projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Navbar ── */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-bold text-sm">
            CB
          </div>
          <h1 className="text-lg font-bold text-white">CollabBoard</h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-300">{user?.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              user?.role === 'admin'
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-gray-700 text-gray-400'
            }`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">My Projects</h2>
            <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span> New Project
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 ml-4">✕</button>
          </div>
        )}

        {/* ── Create Project Modal ── */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">New Project</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>
              <input
                placeholder="Project name *"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-5 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!form.name.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Project
                </button>
                <button
                  onClick={() => { setShowCreate(false); setForm({ name: '', description: '' }); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-white">Delete Project?</h3>
                <p className="text-gray-400 text-sm mt-2">
                  This will permanently delete the project and all its tasks and messages.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deletingId)}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Project Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No projects yet</h3>
            <p className="text-gray-600 text-sm mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-teal-600 hover:bg-teal-500 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-all group relative flex flex-col"
              >
                {/* ── Admin actions menu ── */}
                {user?.role === 'admin' && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingId(project._id);
                      }}
                      title="Delete project"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {/* ── Card content — clicking navigates ── */}
                <Link
                  to={`/project/${project._id}`}
                  className="flex flex-col flex-1"
                >
                  <div className="flex items-start justify-between mb-2 pr-8">
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors leading-snug">
                      {project.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      project.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    {/* Member avatars */}
                    <div className="flex items-center">
                      {project.members?.slice(0, 5).map((m, i) => (
                        <div
                          key={m._id}
                          title={m.name}
                          style={{ zIndex: 5 - i, marginLeft: i === 0 ? 0 : '-8px' }}
                          className="w-7 h-7 rounded-full bg-teal-700 border-2 border-gray-900 flex items-center justify-center text-xs font-medium relative"
                        >
                          {m.name[0].toUpperCase()}
                        </div>
                      ))}
                      {project.members?.length > 5 && (
                        <span className="text-xs text-gray-500 ml-2">
                          +{project.members.length - 5}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}