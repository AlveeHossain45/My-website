import { useEffect, useState } from 'react';
import { list, update } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function ParentPaymentsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [payments, setPayments] = useState([]);

  const load = async () => {
    const [st, pay] = await Promise.all([list('students'), list('payments')]);
    const kids = st.filter(s => s.parentId === user.id);
    setChildren(kids);
    setPayments(pay.filter(p => kids.some(k => k.id === p.studentId)));
  };
  useEffect(() => { load(); }, []);

  const payNow = async (id) => {
    await update('payments', id, { status: 'paid' }, user.email);
    toast.success('Paid (demo)');
    load();
  };

  const childName = id => children.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Child</th><th className="p-2">Fee</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{childName(p.studentId)}</td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">{p.status!=='paid' && <button className="bg-brand-600 text-white px-3 py-1 rounded" onClick={()=>payNow(p.id)}>Pay</button>}</td>
              </tr>
            ))}
            {payments.length===0 && <tr><td className="p-4 text-gray-500">No fees</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}