import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectApi } from '../api/project.api.js';
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../api/task.api.js';
import { getMessagesApi } from '../api/message.api.js';
import useProjectStore from '../store/projectStore.js';
import { useSocketContext } from '../context/SocketContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import NotificationBell from '../components/NotificationBell.jsx';

const COLUMNS = ['todo', 'in-progress', 'review', 'done'];
const LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinProject, leaveProject } = useSocketContext();
  const { currentProject, setCurrentProject, tasks, setTasks, setMessages } = useProjectStore();
  const [showChat, setShowChat] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo' });
  const [loading, setLoading] = useState(true);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    joinProject(id);
    return () => leaveProject(id);
  }, [id]);

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) return;
    try {
      await createTaskApi(id, taskForm);
      // Zustand updated via socket event — no manual state update needed
      setShowCreateTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo' });
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await updateTaskApi(id, taskId, { status }); }
    catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    try { await deleteTaskApi(id, taskId); }
    catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
        Loading project...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-700">/</span>
          <span className="font-semibold truncate max-w-xs">{currentProject?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Task
          </button>
          <button
            onClick={() => setShowChat((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showChat ? 'bg-teal-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            💬 Chat
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full" style={{ minWidth: `${COLUMNS.length * 300}px` }}>
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col);
              return (
                <div key={col} className="w-72 flex flex-col shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {LABELS[col]}
                    </h3>
                    <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
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

        {/* Real-time Chat Panel */}
        {showChat && <ChatPanel projectId={id} />}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">New Task</h3>
            <input
              placeholder="Task title *"
              value={taskForm.title}
              onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={taskForm.description}
              onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {COLUMNS.map((col) => (
                  <option key={col} value={col}>{LABELS[col]}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreateTask} className="flex-1 bg-teal-600 hover:bg-teal-500 py-2 rounded-lg text-sm font-medium">
                Create Task
              </button>
              <button onClick={() => setShowCreateTask(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}