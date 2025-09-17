import { useEffect, useState } from 'react';
import { list, update } from '../../utils/fakeApi.js';
import dayjs from 'dayjs';
import { exportCSV, exportPDF } from '../../utils/export.js';

export default function FinesPage() {
  const [fines, setFines] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  const load = async () => {
    const [fi, us, bk] = await Promise.all([list('fines'), list('users'), list('books')]);
    setFines(fi); setUsers(us); setBooks(bk);
  };
  useEffect(() => { load(); }, []);

  const usr = id => users.find(u => u.id === id);
  const book = id => books.find(b => b.id === id);

  const markPaid = async (id) => { await update('fines', id, { status: 'paid', paidAt: dayjs().toISOString() }); load(); };
  const exportAll = () => {
    exportCSV('fines', fines);
    exportPDF('fines', ['id','borrowerId','bookId','amount','status','createdAt','paidAt'], fines);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fines</h1>
        <button onClick={exportAll} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Export</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Fine ID</th><th className="p-2">Borrower</th><th className="p-2">Book</th><th className="p-2">Amount</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
          <tbody>
            {fines.map(f => (
              <tr key={f.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{f.id}</td>
                <td className="p-2">{usr(f.borrowerId)?.name}</td>
                <td className="p-2">{book(f.bookId)?.title}</td>
                <td className="p-2">${f.amount}</td>
                <td className="p-2">{f.status}</td>
                <td className="p-2">{f.status !== 'paid' && <button className="text-green-600" onClick={() => markPaid(f.id)}>Mark paid</button>}</td>
              </tr>
            ))}
            {fines.length === 0 && <tr><td className="p-4 text-gray-500">No fines</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}