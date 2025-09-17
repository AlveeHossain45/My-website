import { useEffect, useState } from 'react';
// --- CORRECTED: useForm ইম্পোর্ট করা হয়েছে ---
import { useForm } from 'react-hook-form';
import { create, list, remove, update } from '../../utils/fakeApi.js';
import { ROLES } from '../../utils/permissions.js';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  // --- CORRECTED: useForm হুকটি কল করে handleSubmit ফাংশনটি নেওয়া হয়েছে ---
  const { register, handleSubmit, reset } = useForm();

  const load = async () => setRows(await list('users'));
  useEffect(() => { load(); }, []);

  const save = async (data) => { await create('users', data); reset(); load(); toast.success('User created'); };
  const toggle = async (id, active) => { await update('users', id, { active: !active }); load(); };
  const del = async (id) => { await remove('users', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      {/* এখানে handleSubmit সঠিকভাবে কাজ করবে */}
      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-5 gap-3">
        <input placeholder="Name" {...register('name')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input placeholder="Email" type="email" {...register('email')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input placeholder="Password" type="password" {...register('password')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('role')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Add</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Active</th><th className="p-2">Actions</th></tr></thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.active ? 'Yes' : 'No'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => toggle(u.id, u.active)} className="text-brand-600">{u.active ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => del(u.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="p-4 text-gray-500">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}