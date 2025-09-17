import { useEffect, useRef, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dayjs from 'dayjs';

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [st, subs, msgs] = await Promise.all([list('students'), list('subjects'), list('messages')]);
      const kids = st.filter(s => s.parentId === user.id);
      setChildren(kids);
      const tchIds = Array.from(new Set(subs.filter(su => kids.some(k => k.classId === su.classId)).map(su => su.teacherId)));
      const allUsers = await list('users');
      setTeachers(allUsers.filter(u => tchIds.includes(u.id)));
      setMessages(msgs.reverse());
    })();
  }, [user.id]);

  const thread = messages.filter(m =>
    (m.role === 'Teacher' || m.role === 'Parent') &&
    (!teacherId || m.fromId === teacherId || m.toId === teacherId)
  );

  const send = async () => {
    if (!text.trim()) return;
    await create('messages', { from: user.name, fromId: user.id, role: 'Parent', toId: teacherId || null, text, ts: dayjs().toISOString() }, user.email);
    setText('');
    const msgs = await list('messages'); setMessages(msgs.reverse());
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 shadow h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Messages with Teachers</div>
        <select className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
          <option value="">All teachers</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {thread.map((m,i) => (
          <div key={i} className={`p-2 rounded max-w-[80%] ${m.role==='Parent'?'bg-brand-50 dark:bg-gray-700 ml-auto':'bg-gray-100 dark:bg-gray-700'}`}>
            <div className="text-xs text-gray-500">{m.from} • {dayjs(m.ts).format('HH:mm')}</div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-2 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && send()} placeholder="Type a message..." className="flex-1 rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
        <button onClick={send} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}