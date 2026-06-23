import { useState, useRef, useEffect } from 'react';
import useProjectStore from '../store/projectStore.js';

export default function NotificationBell() {
  const notifications = useProjectStore((s) => s.notifications);
  const markAllRead   = useProjectStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  console.log('🔔 Bell render — total:', notifications.length, '| unread:', unread);

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
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {notifications.length > 0 && (
              <span className="text-xs text-gray-500">{notifications.length} total</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">
                No notifications yet
              </p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 transition-colors ${
                    !n.read ? 'bg-teal-500/5 border-l-2 border-l-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">
                      {n.type === 'TASK_ASSIGNED' ? '📋' : '✏️'}
                    </span>
                    <div>
                      <p className="text-sm text-gray-200">{n.message}</p>
                      <span className="text-xs text-gray-600 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}