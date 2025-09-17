import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function FeesSetupPage() {
  const [feeTemplates, setFeeTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD') }
  });

  const load = async () => {
    const [tmpls, cls, st] = await Promise.all([list('feeTemplates'), list('classes'), list('students')]);
    setFeeTemplates(tmpls); setClasses(cls); setStudents(st);
  };
  useEffect(() => { load(); }, []);

  const saveTemplate = async (data) => {
    await create('feeTemplates', { ...data, amount: Number(data.amount) });
    toast.success('Fee template created');
    reset(); load();
  };

  const deleteTemplate = async (id) => { await remove('feeTemplates', id); load(); };

  const applyFee = async (template) => {
    const targetStudents = students.filter(s => s.classId === template.classId);
    if (targetStudents.length === 0) return toast.error(`No students found for class ${template.classId}`);
    
    // Create payment records for all targeted students
    for (const student of targetStudents) {
      await create('payments', {
        studentId: student.id,
        title: template.title,
        amount: template.amount,
        dueDate: template.dueDate,
        status: 'pending'
      });
    }
    toast.success(`Fee applied to ${targetStudents.length} students.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fee Management Setup</h1>

      <form onSubmit={handleSubmit(saveTemplate)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-5 gap-3">
        <div className="md:col-span-5 font-semibold">Create Fee Template</div>
        <input placeholder="Title (e.g., Tuition Fee T1)" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <input type="number" step="0.01" placeholder="Amount" {...register('amount')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('classId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Apply to Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" {...register('dueDate')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Save Template</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Fee Templates</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Title</th><th className="p-2">Amount</th><th className="p-2">Applies to Class</th><th className="p-2">Due Date</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeTemplates.map(t => (
              <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{t.title}</td>
                <td className="p-2">${t.amount}</td>
                <td className="p-2">{classes.find(c=>c.id===t.classId)?.name || t.classId}</td>
                <td className="p-2">{t.dueDate}</td>
                <td className="p-2 space-x-2">
                  <button className="text-brand-600" onClick={() => applyFee(t)}>Apply Now</button>
                  <button className="text-red-600" onClick={() => deleteTemplate(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {feeTemplates.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No fee templates defined.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}