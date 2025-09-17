import { useEffect, useState } from 'react';
import { create, list, remove, update } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { exportCSV, exportPDF } from '../../utils/export.js';

export default function CatalogPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => setBooks(await list('books'));
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    await create('books', { ...data, copies: Number(data.copies || 1) }, user.email);
    toast.success('Book added to catalog');
    reset(); load();
  };
  
  const increaseCopies = async (book) => {
    await update('books', book.id, { copies: (book.copies || 0) + 1 }, user.email);
    load();
  };
  const decreaseCopies = async (book) => {
    if ((book.copies || 0) <= 1) return toast.error('Cannot remove last copy');
    await update('books', book.id, { copies: (book.copies || 0) - 1 }, user.email);
    load();
  };

  const del = async (id) => { await remove('books', id, user.email); load(); };
  
  const exportData = () => {
    exportCSV('library_catalog', books);
    exportPDF('library_catalog', ['title','author','copies','isbn'], books);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library Catalog</h1>
        <button onClick={exportData} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Export</button>
      </div>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
        <input placeholder="Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input placeholder="Author" {...register('author')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input type="number" min="1" placeholder="Copies" {...register('copies')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" defaultValue={1} required />
        <input placeholder="ISBN (Optional)" {...register('isbn')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded md:col-span-1">Add Book</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Books in Stock ({books.length})</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Title</th><th className="p-2">Author</th><th className="p-2">ISBN</th><th className="p-2">Copies</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{b.title}</td>
                <td className="p-2">{b.author}</td>
                <td className="p-2">{b.isbn || '-'}</td>
                <td className="p-2 flex items-center gap-2">
                    {b.copies}
                    <div className='flex gap-1'>
                        <button className='text-green-600 text-lg leading-none' onClick={() => increaseCopies(b)}>+</button>
                        <button className='text-red-600 text-lg leading-none' onClick={() => decreaseCopies(b)}>-</button>
                    </div>
                </td>
                <td className="p-2">
                  <button className="text-red-600" onClick={() => del(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {books.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>Catalog is empty.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}