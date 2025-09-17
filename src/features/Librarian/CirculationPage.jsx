import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { create, list, update } from '../../utils/fakeApi.js';

const FINE_PER_DAY = 1; // $1 per day late
const DEFAULT_LOAN_DAYS = 14;

export default function CirculationPage() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [active, setActive] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const { register: regReturn, handleSubmit: submitReturn, reset: resetReturn } = useForm();

  const load = async () => {
    const [bks, us, br] = await Promise.all([list('books'), list('users'), list('borrows')]);
    setBooks(bks);
    setUsers(us);
    setBorrows(br);
    setActive(br.filter(x => !x.returnDate));
  };
  useEffect(() => { load(); }, []);

  const bookById = id => books.find(b => b.id === id);
  const userById = id => users.find(u => u.id === id);

  const availableCopies = useMemo(() => {
    const count = {};
    active.forEach(b => { count[b.bookId] = (count[b.bookId] || 0) + 1; });
    const map = {};
    books.forEach(b => { map[b.id] = (b.copies || 0) - (count[b.id] || 0); });
    return map;
  }, [books, active]);

  const findBook = query => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return null;
    return books.find(b =>
      b.id.toLowerCase() === q ||
      (b.barcode && String(b.barcode).toLowerCase() === q) ||
      (b.isbn && String(b.isbn).toLowerCase() === q) ||
      b.title.toLowerCase().includes(q)
    );
  };
  const findUser = query => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return null;
    return users.find(u =>
      u.id.toLowerCase() === q ||
      u.email?.toLowerCase() === q ||
      u.name?.toLowerCase().includes(q)
    );
  };

  const onIssue = async (data) => {
    const b = findBook(data.bookQuery);
    const u = findUser(data.borrowerQuery);
    if (!b) return toast.error('Book not found');
    if (!u) return toast.error('Borrower not found');
    if ((availableCopies[b.id] || 0) <= 0) return toast.error('No copies available');

    const issueDate = dayjs();
    const dueDate = issueDate.add(Number(data.loanDays || DEFAULT_LOAN_DAYS), 'day');
    await create('borrows', {
      bookId: b.id,
      borrowerId: u.id,
      issueDate: issueDate.format('YYYY-MM-DD'),
      dueDate: dueDate.format('YYYY-MM-DD'),
      method: data.method || 'manual', // barcode/rfid/manual
    }, u.email);
    toast.success('Book issued');
    reset({ loanDays: DEFAULT_LOAN_DAYS, method: 'barcode' });
    load();
  };

  const onReturn = async (data) => {
    let borrow = null;
    if (data.borrowId) {
      borrow = borrows.find(x => x.id === data.borrowId);
    } else {
      const b = findBook(data.bookQuery);
      const u = findUser(data.borrowerQuery);
      if (!b || !u) return toast.error('Provide valid book and borrower');
      borrow = active
        .filter(x => x.bookId === b.id && x.borrowerId === u.id)
        .sort((a,b2) => dayjs(a.issueDate).valueOf() - dayjs(b2.issueDate).valueOf())[0];
    }
    if (!borrow) return toast.error('Active borrow not found');

    const returnDate = dayjs();
    const due = dayjs(borrow.dueDate);
    const daysLate = Math.max(0, returnDate.diff(due, 'day'));
    const fine = daysLate * FINE_PER_DAY;

    await update('borrows', borrow.id, {
      returnDate: returnDate.format('YYYY-MM-DD'),
      fine,
    });
    if (fine > 0) {
      await create('fines', {
        borrowId: borrow.id,
        borrowerId: borrow.borrowerId,
        bookId: borrow.bookId,
        amount: fine,
        status: 'unpaid',
        createdAt: returnDate.toISOString(),
      });
    }
    toast.success(fine > 0 ? `Returned. Fine: $${fine}` : 'Returned. No fine.');
    resetReturn();
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Library Circulation</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onIssue)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Issue Book</div>
          <div>
            <label className="block text-sm mb-1">Book (Barcode/ISBN/Title)</label>
            <input list="bookOptions" {...register('bookQuery')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
            <datalist id="bookOptions">
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm mb-1">Borrower (RFID/Email/Name)</label>
            <input list="userOptions" {...register('borrowerQuery')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
            <datalist id="userOptions">
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Loan days</label>
              <input type="number" defaultValue={DEFAULT_LOAN_DAYS} {...register('loanDays')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Method</label>
              <select {...register('method')} defaultValue="barcode" className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
                <option value="barcode">Barcode</option>
                <option value="rfid">RFID</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Issue</button>
        </form>

        <form onSubmit={submitReturn(onReturn)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Return Book</div>
          <div className="text-xs text-gray-500">You can provide Borrow ID directly, or Book + Borrower.</div>
          <div>
            <label className="block text-sm mb-1">Borrow ID</label>
            <input {...regReturn('borrowId')} placeholder="Optional" className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Book</label>
              <input list="bookOptions" {...regReturn('bookQuery')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Borrower</label>
              <input list="userOptions" {...regReturn('borrowerQuery')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
            </div>
          </div>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Return</button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">Active Borrows</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Borrow ID</th>
                <th className="p-2">Book</th>
                <th className="p-2">Borrower</th>
                <th className="p-2">Issued</th>
                <th className="p-2">Due</th>
                <th className="p-2">Days Left</th>
                <th className="p-2">Avail</th>
              </tr>
            </thead>
            <tbody>
              {active.map(b => {
                const book = bookById(b.bookId);
                const usr = userById(b.borrowerId);
                const due = dayjs(b.dueDate);
                const daysLeft = due.diff(dayjs(), 'day');
                return (
                  <tr key={b.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{b.id}</td>
                    <td className="p-2">{book?.title || b.bookId}</td>
                    <td className="p-2">{usr?.name} ({usr?.role})</td>
                    <td className="p-2">{b.issueDate}</td>
                    <td className="p-2">{b.dueDate}</td>
                    <td className="p-2">{daysLeft >= 0 ? daysLeft : <span className="text-red-600">{daysLeft}</span>}</td>
                    <td className="p-2">{availableCopies[b.bookId] ?? 0}</td>
                  </tr>
                );
              })}
              {active.length === 0 && <tr><td colSpan={7} className="p-4 text-gray-500">No active borrows</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}