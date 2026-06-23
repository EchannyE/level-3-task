import { useState, useRef, useEffect } from 'react';
import useProjectStore from '../store/projectStore.js';

export default function NotificationBell() {
  const { notifications, markAllRead } = useProjectStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleToggle} className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-0.5 font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h4 className="font-semibold text-sm">Notifications</h4>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">All clear! No notifications.</p>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-800 last:border-0 ${
                    !n.read ? 'bg-teal-500/5' : ''
                  }`}
                >
                  <p className="text-sm text-gray-300">{n.message}</p>
                  <span className="text-xs text-gray-600 mt-1 block">
                    {new Date(n.id).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}