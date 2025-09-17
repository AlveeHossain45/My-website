import { useEffect, useState } from 'react';
import { create, list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dayjs from 'dayjs';

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [today, setToday] = useState({});

  const load = async () => {
    const st = await list('students');
    setStudents(st);
    const att = await list('attendance', { date: dayjs().format('YYYY-MM-DD') });
    const map = {}; att.forEach(a => { map[a.studentId] = a.present; });
    setToday(map);
  };
  useEffect(() => { load(); }, []);

  const mark = async (studentId, present) => {
    await create('attendance', { studentId, present, date: dayjs().format('YYYY-MM-DD'), markedBy: user.id }, user.email);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <table className="min-w-full text-sm">
          <thead><tr><th className="p-2 text-left">Student</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{today[s.id] === undefined ? '—' : today[s.id] ? 'Present' : 'Absent'}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => mark(s.id, true)} className="text-green-600">Present</button>
                  <button onClick={() => mark(s.id, false)} className="text-red-600">Absent</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td className="p-4 text-gray-500">No students</td></tr>}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-2">Supports manual, QR, RFID, biometric — QR/RFID/biometric integrations can be plugged into this flow.</div>
      </div>
    </div>
  );
}