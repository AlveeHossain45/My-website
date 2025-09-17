import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function StaffShiftsPage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: dayjs().format('YYYY-MM-DD'), start: '08:00', end: '16:00' }
  });

  const load = async () => {
    const [allShifts, users] = await Promise.all([list('shifts'), list('users')]);
    setStaffUsers(users.filter(u => ['Staff', 'Librarian', 'Accountant'].includes(u.role)));
    // Display shifts relevant to the user's role or all if Admin
    setShifts(allShifts.filter(s => user.role === 'Admin' || s.userId === user.id).sort((a,b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
  };
  useEffect(() => { load(); }, [user.id]);

  const staffMap = staffUsers.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {});

  const save = async (data) => {
    if (!data.userId) return toast.error('Select staff member');
    await create('shifts', data);
    toast.success('Shift added');
    reset({ date: dayjs().format('YYYY-MM-DD'), start: '08:00', end: '16:00' });
    load();
  };

  const del = async (id) => { await remove('shifts', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Shifts</h1>
      
      {user.role === 'Admin' && (
        <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-5 gap-3">
          <select {...register('userId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Staff</option>
            {staffUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <input type="date" {...register('date')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <input type="time" {...register('start')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <input type="time" {...register('end')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Add Shift</button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">{user.role === 'Admin' ? 'All Shifts' : 'My Shifts'}</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              {user.role === 'Admin' && <th className="p-2">Staff</th>}
              <th className="p-2">Date</th><th className="p-2">Start</th><th className="p-2">End</th><th className="p-2">Hours</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(s => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                {user.role === 'Admin' && <td className="p-2">{staffMap[s.userId] || s.userId}</td>}
                <td className="p-2">{s.date}</td>
                <td className="p-2">{s.start}</td>
                <td className="p-2">{s.end}</td>
                <td className="p-2">
                  {dayjs(s.date + ' ' + s.end).diff(dayjs(s.date + ' ' + s.start), 'hour', true).toFixed(1)}
                </td>
                <td className="p-2">
                  <button className="text-red-600" onClick={() => del(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {shifts.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No shifts assigned.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}