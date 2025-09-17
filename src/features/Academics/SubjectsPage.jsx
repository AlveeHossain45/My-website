import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [sub, cls, tch] = await Promise.all([list('subjects'), list('classes'), list('teachers')]);
    setSubjects(sub); setClasses(cls); setTeachers(tch.filter(u => u.role === 'Teacher'));
  };
  useEffect(() => { load(); }, []);

  const classMap = classes.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
  const teacherMap = teachers.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {});

  const save = async (data) => {
    if (!data.classId || !data.teacherId) return toast.error('Missing class or teacher');
    await create('subjects', data);
    toast.success('Subject added');
    reset(); load();
  };
  
  const del = async (id) => { await remove('subjects', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Subjects</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
        <input placeholder="Subject Name" {...register('name')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('classId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select {...register('teacherId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Add Subject</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Subject List</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Name</th><th className="p-2">Class</th><th className="p-2">Teacher</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{classMap[s.classId] || s.classId}</td>
                <td className="p-2">{teacherMap[s.teacherId] || s.teacherId}</td>
                <td className="p-2">
                  <button className="text-red-600" onClick={() => del(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={4}>No subjects defined.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}