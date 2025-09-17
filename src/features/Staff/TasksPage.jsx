import { useEffect, useState } from 'react';
import { create, list, update, remove } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function StaffTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { status: 'open', due: dayjs().add(3, 'day').format('YYYY-MM-DD') }
  });

  const load = async () => {
    const [allTasks, users] = await Promise.all([list('tasks'), list('users')]);
    setStaffUsers(users.filter(u => ['Staff', 'Librarian', 'Accountant', 'Admin'].includes(u.role)));
    // Staff/Teacher/Accountant only see tasks assigned to them/open tasks
    const relevantTasks = allTasks.filter(t => 
      user.role === 'Admin' || t.assignedTo === user.id || t.status === 'open'
    );
    setTasks(relevantTasks.sort((a,b) => dayjs(a.due).valueOf() - dayjs(b.due).valueOf()));
  };
  useEffect(() => { load(); }, [user.id]);

  const staffMap = staffUsers.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {});

  const save = async (data) => {
    await create('tasks', { ...data, assignedBy: user.id });
    toast.success('Task created');
    reset({ status: 'open', due: dayjs().add(3, 'day').format('YYYY-MM-DD') });
    load();
  };

  const setStatus = async (id, status) => {
    await update('tasks', id, { status });
    toast.success(`Task marked as ${status}`);
    load();
  };
  
  const del = async (id) => { await remove('tasks', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Operational Tasks</h1>

      {user.role === 'Admin' && (
        <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
          <input placeholder="Task Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <select {...register('assignedTo')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Assign To</option>
            {staffUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <input type="date" {...register('due')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Create Task</button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">My Tasks</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Title</th><th className="p-2">Assigned To</th><th className="p-2">Due</th><th className="p-2">Status</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{staffMap[t.assignedTo] || t.assignedTo}</td>
                <td className="p-2">{t.due}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${t.status==='open'?'bg-blue-100 text-blue-700':t.status==='complete'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{t.status}</span>
                </td>
                <td className="p-2 space-x-2">
                  {t.status === 'open' && t.assignedTo === user.id && (
                    <button className="text-green-600" onClick={() => setStatus(t.id, 'complete')}>Complete</button>
                  )}
                  {user.role === 'Admin' && <button className="text-red-600" onClick={() => del(t.id)}>Delete</button>}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No tasks found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}