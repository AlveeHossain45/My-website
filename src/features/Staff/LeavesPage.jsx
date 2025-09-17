import { useEffect, useState } from 'react';
import { create, list, update } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function StaffLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { type: 'Sick', startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().add(1, 'day').format('YYYY-MM-DD') }
  });
  
  const load = async () => {
    const allLeaves = await list('leaves');
    // Staff user only sees their own leaves + admin can see all
    setLeaves(allLeaves.filter(l => user.role === 'Admin' || l.userId === user.id));
  };
  useEffect(() => { load(); }, [user.id]);

  const requestLeave = async (data) => {
    if (dayjs(data.startDate).isAfter(dayjs(data.endDate))) {
      return toast.error('Start date must be before end date.');
    }
    await create('leaves', { ...data, userId: user.id, status: 'Pending' });
    toast.success('Leave request submitted');
    reset(); load();
  };
  
  const approve = async (id) => { await update('leaves', id, { status: 'Approved' }); load(); };
  const reject = async (id) => { await update('leaves', id, { status: 'Rejected' }); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave Requests</h1>

      <form onSubmit={handleSubmit(requestLeave)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3 max-w-2xl">
        <div className="font-semibold">Submit New Request</div>
        <div className="grid md:grid-cols-2 gap-3">
          <select {...register('type')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <option>Sick</option><option>Annual</option><option>Maternity/Paternity</option><option>Unpaid</option>
          </select>
          <input type="date" {...register('startDate')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <input type="date" {...register('endDate')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <input placeholder="Reason" {...register('reason')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Submit Request</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">My Leaves</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Type</th><th className="p-2">Start</th><th className="p-2">End</th><th className="p-2">Reason</th><th className="p-2">Status</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{l.type}</td>
                <td className="p-2">{l.startDate}</td>
                <td className="p-2">{l.endDate}</td>
                <td className="p-2">{l.reason}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2 space-x-2">
                  {user.role === 'Admin' && l.status === 'Pending' && (
                    <>
                      <button className="text-green-600" onClick={() => approve(l.id)}>Approve</button>
                      <button className="text-red-600" onClick={() => reject(l.id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={6}>No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}