import { useEffect, useState } from 'react';
import { list, update, create } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [pay, st] = await Promise.all([list('payments'), list('students')]);
    setStudents(st);
    setPayments(pay.sort((a,b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const recordPayment = async (data) => {
    if (!data.studentId) return toast.error('Select student');
    await create('payments', {
      studentId: data.studentId,
      title: data.title,
      amount: Number(data.amount),
      status: 'paid',
      method: data.method,
      createdAt: dayjs().toISOString(),
      dueDate: dayjs().format('YYYY-MM-DD') // dummy due date for simplicity
    });
    toast.success('Offline payment recorded');
    reset(); load();
  };
  
  const markAsPaid = async (id) => {
    await update('payments', id, { status: 'paid', paidAt: dayjs().toISOString() });
    toast.success('Marked as paid');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions & Payments</h1>

      <form onSubmit={handleSubmit(recordPayment)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
        <div className="md:col-span-4 font-semibold">Record Offline Payment</div>
        <select {...register('studentId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input placeholder="Fee Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input type="number" step="0.01" placeholder="Amount Paid" {...register('amount')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('method')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
        </select>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded md:col-span-4">Record Payment</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">All Payments</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Student</th><th className="p-2">Fee</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Date</th><th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{studentMap[p.studentId] || p.studentId}</td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${p.status==='paid'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{p.status}</span>
                </td>
                <td className="p-2">{dayjs(p.createdAt || p.paidAt).format('YYYY-MM-DD')}</td>
                <td className="p-2">
                  {p.status !== 'paid' && <button className="text-green-600" onClick={() => markAsPaid(p.id)}>Mark Paid</button>}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={6}>No payment transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}