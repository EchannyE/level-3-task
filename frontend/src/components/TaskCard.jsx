import { useState, useRef, useEffect } from 'react';

const PRIORITY_STYLES = {
  low:    'text-green-400 bg-green-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high:   'text-red-400 bg-red-400/10',
};

export default function TaskCard({ task, columns, columnLabels, onStatusChange, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors group relative">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-snug">{task.title}</h4>
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-600 hover:text-gray-300 text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity px-1"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-xl py-1.5 z-20 min-w-[140px] shadow-2xl">
              <p className="px-3 py-1 text-xs text-gray-500 font-medium">Move to</p>
              {columns
                .filter((c) => c !== task.status)
                .map((col) => (
                  <button
                    key={col}
                    onClick={() => { onStatusChange(task._id, col); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {columnLabels[col]}
                  </button>
                ))}
              <hr className="border-gray-700 my-1" />
              <button
                onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 transition-colors"
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.assignedTo && (
          <div
            className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-xs font-medium"
            title={task.assignedTo.name}
          >
            {task.assignedTo.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}