import { useEffect, useMemo, useState } from 'react';
import { list } from '../../utils/fakeApi.js';

export default function FinanceReportsPage() {
  const [payments, setPayments] = useState([]);
  const [fines, setFines] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    (async () => {
      const [pmt, fn, pr, mv] = await Promise.all([
        list('payments'), list('fines'), list('payrolls'), list('stockMovements')
      ]);
      setPayments(pmt); setFines(fn); setPayrolls(pr); setMovements(mv);
    })();
  }, []);

  const revenue = useMemo(() => {
    const fees = payments.filter(p => p.status === 'paid').reduce((a,b)=>a + Number(b.amount||0), 0);
    const finesPaid = fines.filter(f => f.status === 'paid').reduce((a,b)=>a + Number(b.amount||0), 0);
    return fees + finesPaid;
  }, [payments, fines]);

  const expenses = useMemo(() => {
    const payrollPaid = payrolls.filter(p => p.status === 'paid').reduce((a,b)=>a + Number(b.net||0), 0);
    const inventoryPurchases = movements?.filter(m => m.type === 'in').reduce((a,b)=>a + Number(b.total||0), 0) || 0;
    return payrollPaid + inventoryPurchases;
  }, [payrolls, movements]);

  const net = revenue - expenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finance Summary</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card label="Total Revenue" value={`$${revenue.toFixed(2)}`} />
        <Card label="Total Expenses" value={`$${expenses.toFixed(2)}`} />
        <Card label="Net" value={`$${net.toFixed(2)}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">Revenue Sources</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between"><span>Fee payments</span><span>${(payments.filter(p => p.status==='paid').reduce((a,b)=>a+Number(b.amount||0),0)).toFixed(2)}</span></li>
            <li className="flex justify-between"><span>Fines</span><span>${(fines.filter(f => f.status==='paid').reduce((a,b)=>a+Number(b.amount||0),0)).toFixed(2)}</span></li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">Expenses</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between"><span>Payroll (paid)</span><span>${(payrolls.filter(p=>p.status==='paid').reduce((a,b)=>a+Number(b.net||0),0)).toFixed(2)}</span></li>
            <li className="flex justify-between"><span>Inventory purchases</span><span>${(movements?.filter(m=>m.type==='in').reduce((a,b)=>a+Number(b.total||0),0) || 0).toFixed(2)}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}