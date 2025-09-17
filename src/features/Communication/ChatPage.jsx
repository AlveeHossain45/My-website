import { useEffect, useRef, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dayjs from 'dayjs';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  const load = async () => setMessages((await list('messages')).slice(0, 200).reverse());
  useEffect(() => { load(); const i = setInterval(load, 1500); return () => clearInterval(i); }, []);

  const send = async () => {
    if (!text.trim()) return;
    await create('messages', { from: user.name, role: user.role, text, ts: dayjs().toISOString() }, user.email);
    setText(''); load(); endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 shadow h-[70vh] flex flex-col">
      <div className="font-semibold mb-2">Internal Chat</div>
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m,i) => (
          <div key={i} className="p-2 rounded max-w-[75%] bg-gray-100 dark:bg-gray-700">
            <div className="text-xs text-gray-500">{m.from} ({m.role}) • {dayjs(m.ts).format('HH:mm')}</div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-2 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message..." className="flex-1 rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
        <button onClick={send} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}