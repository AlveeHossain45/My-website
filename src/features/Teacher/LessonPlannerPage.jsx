import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function LessonPlannerPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [allPlans, subs] = await Promise.all([list('lessonPlans'), list('subjects')]);
    const mySubjects = subs.filter(s => s.teacherId === user.id);
    setSubjects(mySubjects);
    setPlans(allPlans.filter(p => mySubjects.some(s => s.id === p.subjectId)).sort((a,b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const subjectMap = subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const save = async (data) => {
    if (!data.subjectId) return toast.error('Please select a subject.');
    await create('lessonPlans', { ...data, teacherId: user.id });
    toast.success('Lesson plan saved');
    reset(); load();
  };

  const del = async (id) => { await remove('lessonPlans', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lesson Planner</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        <div className="font-semibold">Create New Plan</div>
        <div className="grid md:grid-cols-3 gap-3">
          <select {...register('subjectId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" {...register('date')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" defaultValue={dayjs().format('YYYY-MM-DD')} required />
          <input placeholder="Topic Covered" {...register('topic')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <div>
          <textarea placeholder="Activities / Notes" {...register('notes')} rows={3} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Save Plan</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">My Recent Plans</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Date</th><th className="p-2">Subject</th><th className="p-2">Topic</th><th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">{subjectMap[p.subjectId] || p.subjectId}</td>
                  <td className="p-2">{p.topic}</td>
                  <td className="p-2">
                    <button className="text-red-600" onClick={() => del(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={4}>No lesson plans created.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}