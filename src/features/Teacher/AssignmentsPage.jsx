import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [allAssign, subs] = await Promise.all([list('assignments'), list('subjects')]);
    const mySubjects = subs.filter(s => s.teacherId === user.id);
    setSubjects(mySubjects);
    setAssignments(allAssign.filter(a => mySubjects.some(s => s.id === a.subjectId)).sort((a,b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const subjectMap = subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const save = async (data) => {
    if (!data.subjectId) return toast.error('Select subject');
    await create('assignments', { ...data, teacherId: user.id });
    toast.success('Assignment created');
    reset(); load();
  };

  const del = async (id) => { await remove('assignments', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assignments</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        <div className="font-semibold">Create New Assignment</div>
        <div className="grid md:grid-cols-4 gap-3">
          <input placeholder="Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <select {...register('subjectId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" {...register('dueDate')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
          <input type="number" step="1" placeholder="Max Points" {...register('maxPoints')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <div>
          <textarea placeholder="Instructions" {...register('instructions')} rows={3} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Create Assignment</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">My Active Assignments</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Title</th><th className="p-2">Subject</th><th className="p-2">Due Date</th><th className="p-2">Points</th><th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{subjectMap[a.subjectId] || a.subjectId}</td>
                  <td className="p-2">{a.dueDate}</td>
                  <td className="p-2">{a.maxPoints}</td>
                  <td className="p-2">
                    <button className="text-red-600" onClick={() => del(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No active assignments.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}