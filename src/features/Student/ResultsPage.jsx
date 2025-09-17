import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    (async () => {
      const [gr, ex, sub, sbs] = await Promise.all([
        list('grades'),
        list('exams'),
        list('subjects'),
        list('submissions')
      ]);
      setGrades(gr.filter(g => g.studentId === user.id));
      setExams(ex);
      setSubjects(sub);
      setSubmissions(sbs);
    })();
  }, [user.id]);

  // Calculate average grade per subject
  const subjectAverages = subjects.map(subj => {
    const studentGrade = grades.find(g => g.subjectId === subj.id);
    return {
      name: subj.name,
      average: studentGrade ? studentGrade.score : 0, // Use 0 if no grade recorded
    };
  });

  // Calculate average exam score per exam
  const examResults = exams.map(exam => {
    const studentSubmission = submissions.find(
      sub => sub.examId === exam.id && sub.studentId === user.id
    );
    return {
      name: exam.title,
      score: studentSubmission ? (studentSubmission.score || 0) : 0,
      maxScore: studentSubmission ? studentSubmission.maxScore : 0,
    };
  });

  const chartDataGrades = subjectAverages.map(avg => ({
    name: avg.name,
    'Average Grade': avg.average,
  }));

  const chartDataExams = examResults.map(res => ({
    name: res.name,
    'Exam Score': res.score,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Results</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-4">Subject Grades</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataGrades}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Average Grade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-4">Exam Performance</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataExams}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => `${props.payload.score}/${props.payload.maxScore}`} />
              <Bar dataKey="Exam Score" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}