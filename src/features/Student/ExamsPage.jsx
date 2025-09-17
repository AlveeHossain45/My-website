import { useEffect, useMemo, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { plagiarismScore } from '../../utils/ai.js';

export default function StudentExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [myExam, setMyExam] = useState(null);

  const load = async () => {
    const [ex, subs, st] = await Promise.all([list('exams'), list('submissions'), list('students')]);
    let examsList = ex;
    if (examsList.length === 0) {
      const demo = await create('exams', {
        title: 'Demo Exam',
        classId: students.find(s => s.id === user.id)?.classId || 'c1',
        dueDate: dayjs().add(7,'day').format('YYYY-MM-DD'),
        sections: [
          { type: 'mcq', questions: [
            { q: '2 + 2 = ?', options: ['3','4','5','6'], answer: 1, points: 2 },
            { q: 'Capital of France?', options: ['Berlin','Madrid','Paris','Rome'], answer: 2, points: 2 }
          ]},
          { type: 'essay', questions: [
            { q: 'Explain the water cycle.', refText: 'Evaporation, condensation, precipitation, collection.', points: 6 }
          ]}
        ]
      });
      examsList = [demo];
    }
    setExams(examsList);
    setSubmissions(subs || []);
    setStudents(st);
  };
  useEffect(() => { load(); }, []);

  const mySubs = submissions.filter(s => s.studentId === user.id);
  const hasSubmitted = (examId) => mySubs.some(s => s.examId === examId);

  const startExam = (exam) => setMyExam(exam);

  return (
    <div className="space-y-6">
      {!myExam && (
        <>
          <h1 className="text-2xl font-bold">Online Exams</h1>
          <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left"><th className="p-2">Title</th><th className="p-2">Due</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {exams.map(e => {
                  const status = hasSubmitted(e.id) ? 'Submitted' : 'Open';
                  return (
                    <tr key={e.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-2">{e.title}</td>
                      <td className="p-2">{e.dueDate}</td>
                      <td className="p-2">{status}</td>
                      <td className="p-2">{status==='Open' && <button className="bg-brand-600 text-white px-3 py-1 rounded" onClick={()=>startExam(e)}>Start</button>}</td>
                    </tr>
                  );
                })}
                {exams.length===0 && <tr><td className="p-4 text-gray-500">No exams</td></tr>}
              </tbody>
            </table>
          </div>

          {mySubs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
              <div className="font-semibold mb-2">My Submissions</div>
              <table className="min-w-full text-sm">
                <thead><tr className="text-left"><th className="p-2">Exam</th><th className="p-2">Score</th><th className="p-2">Plagiarism</th><th className="p-2">Submitted At</th></tr></thead>
                <tbody>
                  {mySubs.map(s => (
                    <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-2">{exams.find(e => e.id === s.examId)?.title || s.examId}</td>
                      <td className="p-2">{s.score}/{s.maxScore}</td>
                      <td className="p-2">{Math.round((s.plagiarism||0)*100)}%</td>
                      <td className="p-2">{new Date(s.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {myExam && <ExamAttempt exam={myExam} onCancel={()=>setMyExam(null)} onDone={()=>{ setMyExam(null); load(); }} userId={user.id} allSubs={submissions} />}
    </div>
  );
}

function ExamAttempt({ exam, onCancel, onDone, userId, allSubs }) {
  const [mcqAns, setMcqAns] = useState({});
  const [essayAns, setEssayAns] = useState({});

  const mcq = exam.sections.find(s => s.type === 'mcq')?.questions || [];
  const essays = exam.sections.find(s => s.type === 'essay')?.questions || [];

  const submit = async () => {
    // Score MCQ
    let score = 0; let maxScore = 0;
    mcq.forEach((q, idx) => {
      maxScore += q.points || 1;
      if (Number(mcqAns[idx]) === Number(q.answer)) score += q.points || 1;
    });
    // Essay plagiarism
    let plag = 0;
    for (let i=0;i<essays.length;i++) {
      const text = (essayAns[i] || '').trim();
      const ref = essays[i].refText || '';
      let maxSim = plagiarismScore(text, ref);
      const otherSubs = allSubs.filter(s => s.examId === exam.id && s.studentId !== userId);
      otherSubs.forEach(s => {
        const otherText = s.answers?.essay?.[i] || '';
        maxSim = Math.max(maxSim, plagiarismScore(text, otherText));
      });
      plag = Math.max(plag, maxSim);
      maxScore += essays[i].points || 0;
      // naive: essay scored 0, teachers can grade later
    }

    const submission = await create('submissions', {
      examId: exam.id,
      studentId: userId,
      answers: { mcq: mcqAns, essay: essayAns },
      score, maxScore,
      plagiarism: plag,
      submittedAt: dayjs().toISOString(),
    });
    toast.success('Submitted');
    onDone(submission);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">{exam.title}</div>
        <button className="text-gray-600" onClick={onCancel}>Cancel</button>
      </div>

      {mcq.length>0 && (
        <div className="space-y-2">
          <div className="font-semibold">MCQs</div>
          {mcq.map((q,idx)=>(
            <div key={idx} className="border rounded p-2">
              <div className="mb-1">{idx+1}. {q.q}</div>
              <div className="grid md:grid-cols-2 gap-2">
                {q.options.map((opt,i)=>(
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={`q-${idx}`} checked={mcqAns[idx] === i} onChange={()=>setMcqAns(a=>({...a,[idx]:i}))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {essays.length>0 && (
        <div className="space-y-2">
          <div className="font-semibold">Essay</div>
          {essays.map((q,idx)=>(
            <div key={idx}>
              <div className="mb-1">{q.q} <span className="text-xs text-gray-500">(reference exists for plagiarism detection)</span></div>
              <textarea className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" rows={5} value={essayAns[idx] || ''} onChange={e=>setEssayAns(a=>({...a,[idx]: e.target.value}))} />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button className="bg-brand-600 text-white px-4 py-2 rounded" onClick={submit}>Submit</button>
        <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}