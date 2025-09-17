import { useEffect, useState } from 'react';
import { create, list, remove, update } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { exportCSV, exportPDF } from '../../utils/export.js';

export default function AdmissionsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => setApps(await list('admissions'));
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    await create('admissions', { ...data, status: 'pending' }, user.email);
    toast.success('Application received');
    reset(); load();
  };

  const setStatus = async (id, status) => {
    await update('admissions', id, { status }, user.email);
    toast.success(`Marked ${status}`);
    load();
  };

  const del = async (id) => { await remove('admissions', id, user.email); load(); };

  const exportData = () => {
    exportCSV('admissions', apps);
    exportPDF('admissions', ['id','name','class','status','createdAt'], apps);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admissions</h1>
        <button onClick={exportData} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Export</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">New Application</div>
          <div>
            <label className="block text-sm">Student Name</label>
            <input {...register('name')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm">Applying Class</label>
            <select {...register('class')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
              <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Guardian Email</label>
            <input type="email" {...register('guardianEmail')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          </div>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Submit</button>
        </form>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">Applications</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2">Name</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.class}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${a.status==='approved'?'bg-green-100 text-green-700':a.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                    </td>
                    <td className="p-2 space-x-2">
                      <button className="text-green-600" onClick={() => setStatus(a.id,'approved')}>Approve</button>
                      <button className="text-red-600" onClick={() => setStatus(a.id,'rejected')}>Reject</button>
                      <button className="text-gray-600" onClick={() => del(a.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={4}>No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}