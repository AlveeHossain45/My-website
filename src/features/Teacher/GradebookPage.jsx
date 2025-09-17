import { useEffect, useState } from 'react';
import { list, update, create } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

function calcGPA(scores) {
  if (!scores.length) return 0;
  const avg = scores.reduce((a,b) => a + b.score, 0) / scores.length;
  // Simple GPA mapping
  if (avg >= 90) return 4.0;
  if (avg >= 80) return 3.5;
  if (avg >= 70) return 3.0;
  if (avg >= 60) return 2.5;
  if (avg >= 50) return 2.0;
  return 0;
}

export default function GradebookPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  const load = async () => {
    const [st, gr, sub] = await Promise.all([list('students'), list('grades'), list('subjects')]);
    setStudents(st);
    setGrades(gr);
    setSubjects(sub.filter(s => s.teacherId === user.id));
    if (sub.length) setSelectedSubject(sub[0].id);
  };
  useEffect(() => { load(); }, []);

  const setScore = async (studentId, score) => {
    let g = grades.find(g => g.studentId === studentId && g.subjectId === selectedSubject);
    if (g) { await update('grades', g.id, { score: Number(score) }, user.email); }
    else { await create('grades', { studentId, subjectId: selectedSubject, score: Number(score) }, user.email); }
    toast.success('Saved'); load();
  };

  const byStudent = (id) => grades.filter(g => g.studentId === id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gradebook</h1>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-4">
        <div className="flex items-center gap-4">
          <div className="font-medium">Subject</div>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-2">Student</th>
                <th className="p-2">Score</th>
                <th className="p-2">GPA</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const scores = byStudent(s.id);
                const current = scores.find(g => g.subjectId === selectedSubject)?.score ?? '';
                const gpa = calcGPA(scores);
                return (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">
                      <input type="number" min="0" max="100" className="w-24 rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" defaultValue={current} onBlur={e => setScore(s.id, e.target.value)} />
                    </td>
                    <td className="p-2">{gpa.toFixed(2)}</td>
                  </tr>
                );
              })}
              {students.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={3}>No students</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}