import { useEffect, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function HealthPage() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: dayjs().format('YYYY-MM-DD') }
  });

  const load = async () => {
    const [st, recs] = await Promise.all([list('students'), list('healthRecords')]);
    setStudents(st);
    setRecords(recs.sort((a,b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const save = async (data) => {
    if (!data.studentId) return toast.error('Select student');
    await create('healthRecords', data);
    toast.success('Health record saved');
    reset({ date: dayjs().format('YYYY-MM-DD') });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health & Medical Records</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3 max-w-2xl">
        <div className="font-semibold">Add New Record/Checkup</div>
        <div className="grid md:grid-cols-2 gap-3">
          <select {...register('studentId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" {...register('date')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <input placeholder="Condition / Diagnosis" {...register('condition')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <textarea placeholder="Notes / Treatment" {...register('notes')} rows={3} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Save Record</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Recent Records</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Date</th><th className="p-2">Student</th><th className="p-2">Condition</th><th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{studentMap[r.studentId] || r.studentId}</td>
                <td className="p-2">{r.condition}</td>
                <td className="p-2 text-xs">{r.notes}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={4}>No health records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}