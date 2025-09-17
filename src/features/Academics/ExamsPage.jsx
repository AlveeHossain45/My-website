import { useEffect, useState } from 'react';
import { create, list, update, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function AcademicsExamsPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD') }
  });

  const load = async () => {
    const [ex, cls, subs, st] = await Promise.all([list('exams'), list('classes'), list('submissions'), list('students')]);
    setExams(ex.sort((a,b) => dayjs(b.dueDate).valueOf() - dayjs(a.dueDate).valueOf()));
    setClasses(cls);
    setSubmissions(subs);
    setStudents(st);
  };
  useEffect(() => { load(); }, []);

  const classMap = classes.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
  const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const save = async (data) => {
    // NOTE: This basic form only creates the exam header. 
    // Content sections (MCQ/Essay) are usually managed via a richer editor.
    await create('exams', { 
        ...data, 
        sections: [
            { type: 'mcq', questions: [] }, 
            { type: 'essay', questions: [] }
        ]
    });
    toast.success('Exam created (Add detailed questions later)');
    reset(); load();
  };
  
  const del = async (id) => { await remove('exams', id); load(); };

  const getSubmissionsCount = (examId) => submissions.filter(s => s.examId === examId).length;
  const getSubmissionsList = (examId) => submissions.filter(s => s.examId === examId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exam Management</h1>

      <form onSubmit={handleSubmit(save)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
        <input placeholder="Exam Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('classId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" {...register('dueDate')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Schedule Exam</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Scheduled Exams</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Title</th><th className="p-2">Class</th><th className="p-2">Due Date</th><th className="p-2">Submissions</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(e => (
              <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{e.title}</td>
                <td className="p-2">{classMap[e.classId] || e.classId}</td>
                <td className="p-2">{e.dueDate}</td>
                <td className="p-2">{getSubmissionsCount(e.id)}</td>
                <td className="p-2 space-x-2">
                  <button className="text-brand-600" onClick={() => alert(`Reviewing submissions for ${e.title}`)}>Review</button>
                  <button className="text-red-600" onClick={() => del(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No exams scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}