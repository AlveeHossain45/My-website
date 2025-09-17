import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { predictDropoutRisk } from '../../utils/ai.js';

export default function AnalyticsPage() {
  const [risk, setRisk] = useState([]);

  useEffect(() => {
    (async () => {
      const students = await list('students');
      const attendance = await list('attendance');
      const grades = await list('grades');
      const attendanceByStudent = {};
      students.forEach(s => {
        const recs = attendance.filter(a => a.studentId === s.id);
        const present = recs.filter(r => r.present).length; const total = recs.length || 1;
        attendanceByStudent[s.id] = present / total;
      });
      const gradeAvgByStudent = {};
      students.forEach(s => {
        const gs = grades.filter(g => g.studentId === s.id).map(g => g.score);
        gradeAvgByStudent[s.id] = gs.length ? gs.reduce((a,b)=>a+b,0)/gs.length/100 : 0.5;
      });
      setRisk(predictDropoutRisk({ students, attendanceByStudent, gradeAvgByStudent }).slice(0,20));
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Predictive Analytics</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">Dropout Risk (Top)</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr><th className="p-2 text-left">Student</th><th className="p-2">Risk</th></tr></thead>
            <tbody>
              {risk.map(r => (
                <tr key={r.studentId} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                      <div className="bg-red-500 h-2" style={{ width: `${Math.round(r.risk*100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{(r.risk*100).toFixed(0)}%</div>
                  </td>
                </tr>
              ))}
              {risk.length === 0 && <tr><td className="p-4 text-gray-500">No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}