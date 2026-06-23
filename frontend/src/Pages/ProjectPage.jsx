import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectApi } from '../api/project.api.js';
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../api/task.api.js';
import { getMessagesApi } from '../api/message.api.js';
import useProjectStore from '../store/projectStore.js';
import useAuthStore from '../store/authStore.js';
import { useSocketContext } from '../context/SocketContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import AddMemberModal from '../components/AddMemberModal.jsx';

const COLUMNS = ['todo', 'in-progress', 'review', 'done'];
const LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { joinProject, leaveProject } = useSocketContext();
  const {
    currentProject,
    setCurrentProject,
    tasks,
    setTasks,
    setMessages,
  } = useProjectStore();

  const [showChat, setShowChat]             = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember]   = useState(false);
  const [showMembers, setShowMembers]       = useState(false);
  const [loading, setLoading]               = useState(true);
  const [taskForm, setTaskForm] = useState({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  assignedTo: '',   // ← ADD THIS
});

  // ─── Load project data on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          getProjectApi(id),
          getTasksApi(id),
          getMessagesApi(id),
        ]);
        setCurrentProject(pRes.data.data.project);
        setTasks(tRes.data.data.tasks);
        setMessages(mRes.data.data.messages);
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
    joinProject(id);
    return () => leaveProject(id);
  }, [id]);

  // ─── Task handlers ────────────────────────────────────────────────────────
 const handleCreateTask = async () => {
  if (!taskForm.title.trim()) return;
  try {
    const payload = { ...taskForm };
    if (!payload.assignedTo) delete payload.assignedTo; // don't send empty string
    await createTaskApi(id, payload);
    setShowCreateTask(false);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
  } catch (err) {
    console.error('Create task error:', err);
  }
};

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskApi(id, taskId, { status });
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskApi(id, taskId);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // ─── Member handler ───────────────────────────────────────────────────────
  const handleMemberAdded = (updatedProject) => {
    setCurrentProject(updatedProject);
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        {/* Left — breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white text-sm shrink-0 transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-gray-700 shrink-0">/</span>
          <span className="font-semibold text-white truncate">{currentProject?.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
            currentProject?.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {currentProject?.status}
          </span>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <NotificationBell />

          {/* Members pill — visible to all */}
          <button
            onClick={() => setShowMembers((v) => !v)}
            className="hidden sm:flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm text-gray-300 transition-colors"
          >
            <span>👥</span>
            <span>{currentProject?.members?.length ?? 0}</span>
          </button>

          {/* Add Member — admin only */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 transition-colors"
            >
              + Member
            </button>
          )}

          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
          >
            + Task
          </button>

          <button
            onClick={() => setShowChat((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showChat
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            💬 Chat
          </button>
        </div>
      </nav>

      {/* ── Members Dropdown ────────────────────────────────────────────────── */}
      {showMembers && (
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Team Members
            </span>
            {currentProject?.members?.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5"
              >
                <div className="w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">
                  {m.name[0].toUpperCase()}
                </div>
                <span className="text-xs text-gray-300">{m.name}</span>
                {currentProject?.owner?._id === m._id && (
                  <span className="text-xs text-teal-400">Owner</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Kanban Board ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto p-6">
          <div
            className="flex gap-4 h-full"
            style={{ minWidth: `${COLUMNS.length * 300}px` }}
          >
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col);
              return (
                <div key={col} className="w-72 flex flex-col shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        col === 'todo'        ? 'bg-gray-400' :
                        col === 'in-progress' ? 'bg-yellow-400' :
                        col === 'review'      ? 'bg-blue-400' :
                                               'bg-green-400'
                      }`} />
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {LABELS[col]}
                      </h3>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-3 flex-1 min-h-[100px]">
                    {colTasks.length === 0 && (
                      <div className="border border-dashed border-gray-800 rounded-xl h-20 flex items-center justify-center">
                        <p className="text-xs text-gray-700">No tasks</p>
                      </div>
                    )}
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        columns={COLUMNS}
                        columnLabels={LABELS}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Real-time Chat Panel ───────────────────────────────────────────── */}
        {showChat && <ChatPanel projectId={id} />}
      </div>

      {/* ── Create Task Modal ────────────────────────────────────────────────── */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button
                onClick={() => setShowCreateTask(false)}
                className="text-gray-500 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <input
              placeholder="Task title *"
              value={taskForm.title}
              onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <textarea
              placeholder="Description (optional)"
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {/* Assign to member */}
<div className="mb-3">
  <label className="block text-xs text-gray-500 mb-1.5">Assign To</label>
  <select
    value={taskForm.assignedTo}
    onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}
    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
  >
    <option value="">Unassigned</option>
    {currentProject?.members?.map((m) => (
      <option key={m._id} value={m._id}>
        {m.name} {m._id === user?._id ? '(you)' : ''}
      </option>
    ))}
  </select>
</div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Initial Column</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {COLUMNS.map((col) => (
                    <option key={col} value={col}>{LABELS[col]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateTask}
                disabled={!taskForm.title.trim()}
                className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowCreateTask(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Member Modal — admin only ────────────────────────────────────── */}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}