import { useEffect, useState } from 'react';
import { list, create } from '../../utils/fakeApi.js';
import dayjs from 'dayjs';
import { exportPDF } from '../../utils/export.js';
import toast from 'react-hot-toast';

export default function TranscriptsPage() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const load = async () => {
    const [st, gr, sub, tr] = await Promise.all([list('students'), list('grades'), list('subjects'), list('transcripts')]);
    setStudents(st);
    setGrades(gr);
    setSubjects(sub);
    setTranscripts(tr.sort((a,b) => dayjs(b.generatedAt).valueOf() - dayjs(a.generatedAt).valueOf()));
  };
  useEffect(() => { load(); }, []);

  const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
  const subjectMap = subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

  const generateTranscript = async () => {
    if (!selectedStudentId) return toast.error('Please select a student.');
    const studentGrades = grades.filter(g => g.studentId === selectedStudentId);
    
    if (studentGrades.length === 0) return toast.error('No grades found for this student.');

    const reportDetails = studentGrades.map(g => ({
      subject: subjectMap[g.subjectId] || g.subjectId,
      score: g.score,
      comment: 'Satisfactory performance' // Mock comment
    }));

    const total = reportDetails.reduce((sum, d) => sum + Number(d.score || 0), 0);
    const avg = (total / reportDetails.length).toFixed(1);

    const transcript = {
      studentId: selectedStudentId,
      name: studentMap[selectedStudentId],
      report: reportDetails,
      average: avg,
      generatedAt: dayjs().toISOString(),
    };
    
    await create('transcripts', transcript);
    toast.success('Transcript generated.');
    load();
    
    // Auto-download PDF
    const pdfRows = reportDetails.map(r => [r.subject, r.score, r.comment]);
    exportPDF(`Transcript_${studentMap[selectedStudentId]}`, ['Subject', 'Score', 'Comment'], pdfRows);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transcripts & Report Cards</h1>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow flex items-center gap-3 max-w-lg">
        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="flex-1 rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <option value="">Select Student to Generate Report</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classId})</option>)}
        </select>
        <button onClick={generateTranscript} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Generate</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Generated Transcripts</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="p-2">Student</th><th className="p-2">Average Score</th><th className="p-2">Generated At</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transcripts.map(t => (
              <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{studentMap[t.studentId] || t.studentId}</td>
                <td className="p-2">{t.average}%</td>
                <td className="p-2">{dayjs(t.generatedAt).format('YYYY-MM-DD')}</td>
                <td className="p-2">
                   <button className="text-brand-600" onClick={() => {
                     const pdfRows = t.report.map(r => [r.subject, r.score, r.comment]);
                     exportPDF(`Transcript_${t.name}_${t.id.substring(0,4)}`, ['Subject', 'Score', 'Comment'], pdfRows);
                   }}>Download PDF</button>
                </td>
              </tr>
            ))}
            {transcripts.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={4}>No transcripts generated.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}