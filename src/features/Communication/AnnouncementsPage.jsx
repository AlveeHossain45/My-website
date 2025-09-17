import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { audience: 'All' }
  });

  const load = async () => {
    const all = await list('announcements');
    // Simple filter: show only announcements intended for the user's role or 'All'
    setAnnouncements(all.filter(a => a.audience === 'All' || a.audience === user.role).sort((a,b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()));
  };
  useEffect(() => { load(); }, [user.role]);

  const save = async (data) => {
    await create('announcements', { ...data, sender: user.name, createdAt: dayjs().toISOString() });
    toast.success('Announcement published');
    reset(); load();
  };
  
  const del = async (id) => { await remove('announcements', id); load(); };
  
  const canPost = ['Admin', 'Teacher', 'Staff'].includes(user.role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      {canPost && (
        <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Create New Announcement</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
            <select {...register('audience')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
              <option value="All">All Users</option>
              <option value="Students">Students</option>
              <option value="Teachers">Teachers</option>
              <option value="Parents">Parents</option>
              <option value="Staff">Staff/Admin</option>
            </select>
          </div>
          <textarea placeholder="Message body" {...register('body')} rows={3} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Publish</button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow border-l-4 border-brand-600">
            <div className="flex justify-between items-start">
              <div className='flex flex-col'>
                <div className="font-semibold text-lg">{a.title}</div>
                <div className="text-xs text-gray-500">To: {a.audience} • By {a.sender} • {dayjs(a.createdAt).format('MMM D, HH:mm')}</div>
              </div>
              {canPost && user.name === a.sender && (
                <button className="text-red-600 text-sm" onClick={() => del(a.id)}>Delete</button>
              )}
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{a.body}</p>
          </div>
        ))}
        {announcements.length === 0 && <div className="p-4 text-gray-500">No announcements found.</div>}
      </div>
    </div>
  );
}