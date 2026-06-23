import { useState, useEffect, useRef } from 'react';
import { sendMessageApi } from '../api/message.api.js';
import useProjectStore from '../store/projectStore.js';
import useAuthStore from '../store/authStore.js';

export default function ChatPanel({ projectId }) {
  const { messages } = useProjectStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendMessageApi(projectId, content);
      // Socket broadcasts to all members, store updated via socket event
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="font-semibold text-sm">Team Chat</h3>
        <p className="text-xs text-teal-400 mt-0.5">● Live</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs mt-8">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id || i} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-teal-800 flex items-center justify-center text-xs font-medium shrink-0">
                {msg.sender?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <span className="text-xs text-gray-500 mb-1">{msg.sender?.name}</span>
                )}
                <div
                  className={`text-sm px-3 py-2 rounded-2xl leading-relaxed ${
                    isOwn
                      ? 'bg-teal-600 text-white rounded-tr-sm'
                      : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message team..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 px-3 py-2 rounded-xl text-sm transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
}