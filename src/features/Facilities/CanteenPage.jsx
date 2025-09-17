import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function CanteenPage() {
  const [menus, setMenus] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: dayjs().format('YYYY-MM-DD') }
  });

  const load = async () => {
    const allMenus = await list('canteenMenus');
    setMenus(allMenus.sort((a,b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    const items = data.items.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return toast.error('Please enter menu items separated by commas.');
    await create('canteenMenus', { date: data.date, items });
    toast.success('Menu published');
    reset(); load();
  };
  
  const del = async (id) => { await remove('canteenMenus', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Canteen Menu Management</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3 max-w-2xl">
        <div className="font-semibold">Publish Daily Menu</div>
        <input type="date" {...register('date')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <textarea placeholder="Menu items (e.g., Rice, Chicken Curry, Salad, Dessert)" {...register('items')} rows={3} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Publish</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Recent Menus</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Date</th><th className="p-2">Items</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menus.map(m => (
              <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{m.date}</td>
                <td className="p-2">{m.items.join(', ')}</td>
                <td className="p-2">
                  <button className="text-red-600" onClick={() => del(m.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {menus.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={3}>No menus published.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}