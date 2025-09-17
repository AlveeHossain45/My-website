import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { predictDropoutRisk } from '../../utils/ai.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformancePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);

  useEffect(() => {
    (async () => {
      const [st, att, gr] = await Promise.all([list('students'), list('attendance'), list('grades')]);
      setStudents(st); setAttendance(att); setGrades(gr);
      
      const attendanceByStudent = {};
      st.forEach(s => {
        const recs = att.filter(a => a.studentId === s.id);
        const present = recs.filter(r => r.present).length; 
        attendanceByStudent[s.id] = recs.length ? (present / recs.length) : 1;
      });

      const gradeAvgByStudent = {};
      st.forEach(s => {
        const gs = gr.filter(g => g.studentId === s.id).map(g => Number(g.score || 0));
        gradeAvgByStudent[s.id] = gs.length ? (gs.reduce((a,b)=>a+b,0)/gs.length/100) : 0.5;
      });

      setRiskStudents(predictDropoutRisk({ students: st, attendanceByStudent, gradeAvgByStudent }).slice(0, 5));
    })();
  }, []);

  // Prepare chart data (e.g., Average Grades by Class)
  const classGradeData = students.reduce((acc, student) => {
    const studentGrades = grades.filter(g => g.studentId === student.id).map(g => Number(g.score || 0));
    const avg = studentGrades.length ? studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length : 0;
    acc[student.classId] = acc[student.classId] || { count: 0, total: 0, classId: student.classId };
    acc[student.classId].count++;
    acc[student.classId].total += avg;
    return acc;
  }, {});

  const chartData = Object.values(classGradeData).map(data => ({
    classId: data.classId,
    averageGrade: Math.round(data.total / data.count)
  }));
  
  const classMap = {}; // In a real app, this would be loaded
  students.forEach(s => classMap[s.classId] = s.classId); // Using ID as name for demo

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance Analysis</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">Average Grades by Class</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="classId" tickFormatter={(id) => classMap[id] || id} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Avg Grade']} />
              <Bar dataKey="averageGrade" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">High Dropout Risk Students (AI Predict)</div>
          <table className="min-w-full text-sm">
            <thead><tr><th className="p-2 text-left">Student</th><th className="p-2">Risk Level</th></tr></thead>
            <tbody>
              {riskStudents.map(r => (
                <tr key={r.studentId} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                      <div className="bg-red-500 h-2" style={{ width: `${Math.round(r.risk*100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{(r.risk*100).toFixed(0)}%</div>
                  </td>
                </tr>
              ))}
              {riskStudents.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={2}>Loading data...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}