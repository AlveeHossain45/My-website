import { useEffect, useState } from 'react';
import { create, list, update } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const { register: regOut, handleSubmit: submitOut, reset: resetOut } = useForm();

  const load = async () => {
    const [inv, mv] = await Promise.all([list('inventory'), list('stockMovements')]);
    setItems(inv);
    setMovements(mv||[]);
  };
  useEffect(() => { load(); }, []);

  const stockIn = async (data) => {
    const name = data.name.trim();
    const qty = Number(data.qty);
    const unit = Number(data.unitCost || 0);
    if (!name || qty <= 0) return;
    let item = items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (!item) {
      item = await create('inventory', { name, qty });
    } else {
      await update('inventory', item.id, { qty: (Number(item.qty||0) + qty) });
    }
    await create('stockMovements', {
      type: 'in', itemId: item.id, qty, unitCost: unit, total: qty*unit, at: dayjs().toISOString()
    });
    toast.success('Stocked in');
    reset();
    load();
  };

  const stockOut = async (data) => {
    const itemId = data.itemId;
    const qty = Number(data.qty);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (qty <= 0 || qty > Number(item.qty||0)) return toast.error('Invalid qty');
    await update('inventory', itemId, { qty: Number(item.qty||0) - qty });
    await create('stockMovements', {
      type: 'out', itemId, qty, at: dayjs().toISOString()
    });
    toast.success('Stocked out');
    resetOut();
    load();
  };

  const nameById = (id) => items.find(i => i.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(stockIn)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Stock In</div>
          <input placeholder="Item name" {...register('name')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="1" placeholder="Qty" {...register('qty')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
            <input type="number" step="0.01" placeholder="Unit cost (optional)" {...register('unitCost')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <button className="bg-brand-600 text-white px-4 py-2 rounded">Add</button>
        </form>

        <form onSubmit={submitOut(stockOut)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Stock Out</div>
          <select {...regOut('itemId')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select item</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name} (Qty: {i.qty})</option>)}
          </select>
          <input type="number" step="1" placeholder="Qty" {...regOut('qty')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <button className="bg-brand-600 text-white px-4 py-2 rounded">Remove</button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Items</div>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Item</th><th className="p-2">Qty</th></tr></thead>
          <tbody>
            {items.map(i => (<tr key={i.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-2">{i.name}</td><td className="p-2">{i.qty}</td></tr>))}
            {items.length===0 && <tr><td className="p-4 text-gray-500">No items</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Stock Movements</div>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Time</th><th className="p-2">Type</th><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Total</th></tr></thead>
          <tbody>
            {(movements||[]).map(m => (
              <tr key={m.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{new Date(m.at).toLocaleString()}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{nameById(m.itemId)}</td>
                <td className="p-2">{m.qty}</td>
                <td className="p-2">{m.total ? `$${m.total}` : '-'}</td>
              </tr>
            ))}
            {(movements||[]).length===0 && <tr><td className="p-4 text-gray-500">No movements</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}