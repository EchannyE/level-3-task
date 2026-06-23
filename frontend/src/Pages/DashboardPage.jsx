import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjectsApi, createProjectApi } from '../api/project.api.js';
import useProjectStore from '../store/projectStore.js';
import useAuthStore from '../store/authStore.js';
import NotificationBell from '../components/NotificationBell.jsx';

export default function DashboardPage() {
  const { projects, setProjects } = useProjectStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectsApi()
      .then((res) => setProjects(res.data.data.projects))
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
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-400">CollabBoard</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-gray-400 text-sm hidden sm:block">{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">My Projects</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Project
          </button>
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">New Project</h3>
              <input
                placeholder="Project name *"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-3">
                <button onClick={handleCreate} className="flex-1 bg-teal-600 hover:bg-teal-500 py-2 rounded-lg text-sm font-medium">
                  Create
                </button>
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No projects yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                className="bg-gray-900 border border-gray-800 hover:border-teal-500/50 rounded-xl p-5 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-3">
                  {project.members?.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center text-xs font-medium"
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <span className="text-xs text-gray-500">+{project.members.length - 4}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}