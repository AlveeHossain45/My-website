import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { create, list, update } from '../../utils/fakeApi.js';

function sum(arr) { return arr.reduce((a,b)=>a + Number(b.amount||0), 0); }

export default function PayrollPage() {
  const [users, setUsers] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [allowances, setAllowances] = useState([{ name: 'HRA', amount: 100 }]);
  const [deductions, setDeductions] = useState([{ name: 'Tax', amount: 50 }]);
  const { register, handleSubmit, watch, reset } = useForm({ defaultValues: { month: dayjs().format('YYYY-MM'), base: 1000 } });

  const base = Number(watch('base') || 0);
  const total = useMemo(() => base + sum(allowances) - sum(deductions), [base, allowances, deductions]);

  const load = async () => {
    const [us, pr] = await Promise.all([list('users'), list('payrolls')]);
    setUsers(us.filter(u => ['Teacher','Staff','Librarian','Accountant','Admin'].includes(u.role)));
    setPayrolls(pr);
  };
  useEffect(() => { load(); }, []);

  const addRow = (setter) => setter(prev => [...prev, { name: '', amount: 0 }]);
  const setRow = (setter, i, patch) => setter(prev => prev.map((r,idx)=> idx===i ? {...r, ...patch} : r));
  const removeRow = (setter, i) => setter(prev => prev.filter((_,idx)=> idx!==i));

  const save = async (data) => {
    if (!data.userId) return toast.error('Pick employee');
    await create('payrolls', {
      userId: data.userId,
      month: data.month,
      base: Number(data.base),
      allowances, deductions,
      net: total,
      status: 'unpaid',
      createdAt: dayjs().toISOString(),
    });
    toast.success('Payroll created');
    reset({ month: dayjs().format('YYYY-MM'), base: 1000, userId: '' });
    setAllowances([{ name: 'HRA', amount: 100 }]);
    setDeductions([{ name: 'Tax', amount: 50 }]);
    load();
  };

  const markPaid = async (id) => { await update('payrolls', id, { status: 'paid', paidAt: dayjs().toISOString() }); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payroll</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Employee</label>
            <select {...register('userId')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
              <option value="">Select</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Month</label>
            <input type="month" {...register('month')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Base Salary</label>
            <input type="number" step="0.01" {...register('base')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          </div>
          <div className="flex items-end">
            <div className="text-lg font-semibold">Net: ${total.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Allowances</div>
              <button type="button" onClick={() => addRow(setAllowances)} className="text-brand-600">+ Add</button>
            </div>
            <div className="space-y-2">
              {allowances.map((r,i)=>(
                <div key={i} className="flex gap-2">
                  <input placeholder="Name" value={r.name} onChange={e=>setRow(setAllowances,i,{name:e.target.value})} className="flex-1 rounded border px-2 py-1 bg-white dark:bg-gray-800" />
                  <input type="number" step="0.01" placeholder="Amount" value={r.amount} onChange={e=>setRow(setAllowances,i,{amount:e.target.value})} className="w-32 rounded border px-2 py-1 bg-white dark:bg-gray-800" />
                  <button type="button" onClick={()=>removeRow(setAllowances,i)} className="text-red-600">x</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Deductions</div>
              <button type="button" onClick={() => addRow(setDeductions)} className="text-brand-600">+ Add</button>
            </div>
            <div className="space-y-2">
              {deductions.map((r,i)=>(
                <div key={i} className="flex gap-2">
                  <input placeholder="Name" value={r.name} onChange={e=>setRow(setDeductions,i,{name:e.target.value})} className="flex-1 rounded border px-2 py-1 bg-white dark:bg-gray-800" />
                  <input type="number" step="0.01" placeholder="Amount" value={r.amount} onChange={e=>setRow(setDeductions,i,{amount:e.target.value})} className="w-32 rounded border px-2 py-1 bg-white dark:bg-gray-800" />
                  <button type="button" onClick={()=>removeRow(setDeductions,i)} className="text-red-600">x</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Create Payroll</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Payroll Records</div>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b border-gray-200 dark:border-gray-700">
            <th className="p-2">Employee</th><th className="p-2">Month</th><th className="p-2">Base</th><th className="p-2">Net</th><th className="p-2">Status</th><th className="p-2">Action</th>
          </tr></thead>
          <tbody>
            {payrolls.map(p => {
              const u = users.find(x => x.id === p.userId);
              return (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2">{u?.name} ({u?.role})</td>
                  <td className="p-2">{p.month}</td>
                  <td className="p-2">${p.base}</td>
                  <td className="p-2">${p.net}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{p.status !== 'paid' && <button className="text-green-600" onClick={()=>markPaid(p.id)}>Mark paid</button>}</td>
                </tr>
              );
            })}
            {payrolls.length === 0 && <tr><td className="p-4 text-gray-500">No payroll records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}