import { useEffect, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  
  // This student's details (needed to find class)
  const [myStudentData, setMyStudentData] = useState(null);

  const load = async () => {
    const [st, subs, allAssign] = await Promise.all([list('students'), list('submissions'), list('assignments')]);
    const mySt = st.find(s => s.id === user.id);
    if (!mySt) return;
    setMyStudentData(mySt);

    const allSubjects = await list('subjects');
    const mySubjects = allSubjects.filter(s => s.classId === mySt.classId);
    setSubjects(mySubjects);

    const myAssignments = allAssign.filter(a => mySubjects.some(s => s.id === a.subjectId));
    setAssignments(myAssignments.sort((a,b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()));
    
    setSubmissions(subs.filter(s => s.studentId === user.id));
  };
  useEffect(() => { load(); }, [user.id]);

  const subjectMap = subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
  const hasSubmitted = (assignId) => submissions.find(s => s.assignmentId === assignId);

  const onSubmit = async (data) => {
    const assignment = assignments.find(a => a.id === data.assignmentId);
    if (!assignment) return toast.error('Assignment not found');
    
    // Check if already submitted
    if (hasSubmitted(assignment.id)) return toast.error('Already submitted this assignment.');

    await create('submissions', {
      assignmentId: assignment.id,
      studentId: user.id,
      content: data.content,
      submittedAt: dayjs().toISOString(),
      score: null,
      maxScore: assignment.maxPoints
    }, user.email);

    toast.success('Assignment submitted');
    reset(); load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Homework</h1>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">Pending Assignments</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Title</th><th className="p-2">Subject</th><th className="p-2">Due Date</th><th className="p-2">Points</th><th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => {
                const sub = hasSubmitted(a.id);
                return (
                  <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{a.title}</td>
                    <td className="p-2">{subjectMap[a.subjectId] || a.subjectId}</td>
                    <td className="p-2">{a.dueDate}</td>
                    <td className="p-2">{a.maxPoints}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${sub ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {sub ? `Submitted (${sub.score ?? 'Awaiting Grade'})` : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={5}>No pending homework.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        <div className="font-semibold">Submit Homework</div>
        <select {...register('assignmentId')} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Assignment to Submit</option>
            {assignments.filter(a => !hasSubmitted(a.id)).map(a => <option key={a.id} value={a.id}>{a.title} ({subjectMap[a.subjectId]})</option>)}
        </select>
        <textarea placeholder="Paste your submission text or link here" {...register('content')} rows={5} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}