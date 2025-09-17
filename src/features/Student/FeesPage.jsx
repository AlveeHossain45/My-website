import { useEffect, useState } from 'react';
import { list, update } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ExclamationCircleIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const StatusBadge = ({ status }) => {
    // ... (same as before) ...
};

export default function FeesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);

  const load = async () => {
    const payments = await list('payments', { studentId: user.id });
    setRows(payments.filter(p => p.status !== 'paid'));
    setHistory(payments.filter(p => p.status === 'paid'));
  };
  useEffect(() => { load(); }, []);

  const pay = async (id) => { /* ... same logic ... */ };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fee Portal</h1>

      {/* ENHANCED: Pending Fees section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Pending Payments</h2>
        </div>
        <ul className="divide-y dark:divide-gray-700">
          {rows.map(r => (
            <li key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-gray-500">Due: {r.dueDate || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-mono">${r.amount}</p>
                <button className="flex items-center gap-2 px-4 py-2 font-semibold text-white rounded-md shadow-sm bg-brand-600 hover:bg-brand-700" onClick={() => pay(r.id)}>
                  <CreditCardIcon className="w-5 h-5" />
                  Pay Now
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="p-4 text-center text-gray-500">No pending fees. Well done!</li>}
        </ul>
      </div>
      
      {/* NEW: Payment History section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* ... (similar structure for payment history) ... */}
      </div>
    </div>
  );
}