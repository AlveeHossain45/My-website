import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { create, list, update } from '../../utils/fakeApi.js';
import { getItem, setItem } from '../../utils/storage.js';

export default function BiometricPage() {
  const [students, setStudents] = useState([]);
  const [attToday, setAttToday] = useState([]);
  const [rfidMap, setRfidMap] = useState(() => getItem('rfid_map', {}));
  const [selStudent, setSelStudent] = useState('');

  const load = async () => {
    const [st, att] = await Promise.all([list('students'), list('attendance')]);
    setStudents(st);
    const today = dayjs().format('YYYY-MM-DD');
    setAttToday(att.filter(a => a.date === today).reverse());
  };
  useEffect(() => { load(); }, []);

  const registerToken = (studentId, token) => {
    if (!studentId || !token) return;
    const map = { ...rfidMap, [token]: studentId };
    setRfidMap(map);
    setItem('rfid_map', map);
    toast.success('RFID token registered');
  };

  const mark = async (studentId, method) => {
    if (!studentId) return;
    await create('attendance', {
      studentId, date: dayjs().format('YYYY-MM-DD'), present: true, method
    });
    toast.success(`Attendance marked via ${method}`);
    load();
  };

  const onScan = (token) => {
    const sid = rfidMap[token];
    if (!sid) return toast.error('Unknown token');
    mark(sid, 'rfid');
  };

  const captureBiometric = async () => {
    if (!selStudent) return toast.error('Select a student');
    // Hook point: integrate WebAuthn / device-specific biometric SDKs here
    await new Promise(res => setTimeout(res, 600));
    mark(selStudent, 'biometric');
  };

  const nameById = id => students.find(s => s.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Biometric / RFID Attendance</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">RFID</div>
          <div className="grid grid-cols-3 gap-2">
            <select className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" onChange={e=>setSelStudent(e.target.value)}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input id="rfidToken" placeholder="Token" className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" />
            <button className="bg-brand-600 text-white px-3 rounded" onClick={()=>{
              const token = document.getElementById('rfidToken').value.trim();
              registerToken(selStudent, token);
              document.getElementById('rfidToken').value = '';
            }}>Register</button>
          </div>
          <div className="flex gap-2">
            <input id="rfidScan" placeholder="Scan token here..." className="flex-1 rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" onKeyDown={e=> e.key==='Enter' && onScan(e.currentTarget.value.trim())} />
            <button className="bg-gray-200 dark:bg-gray-700 px-3 rounded" onClick={()=>{
              const token = document.getElementById('rfidScan').value.trim();
              onScan(token);
              document.getElementById('rfidScan').value = '';
            }}>Scan</button>
          </div>
          <div className="text-xs text-gray-500">Map your hardware reader to this input (it behaves like a keyboard).</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
          <div className="font-semibold">Biometric</div>
          <div className="flex gap-2">
            <select className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" value={selStudent} onChange={e=>setSelStudent(e.target.value)}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button className="bg-brand-600 text-white px-3 py-1 rounded" onClick={captureBiometric}>Capture & Mark Present</button>
          </div>
          <div className="text-xs text-gray-500">Integrate WebAuthn / device SDK to capture actual biometric templates.</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Today's Logs</div>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Time</th><th className="p-2">Student</th><th className="p-2">Method</th></tr></thead>
          <tbody>
            {attToday.map(a => (
              <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{new Date(a.createdAt || Date.now()).toLocaleTimeString()}</td>
                <td className="p-2">{nameById(a.studentId)}</td>
                <td className="p-2">{a.method || 'manual'}</td>
              </tr>
            ))}
            {attToday.length===0 && <tr><td className="p-4 text-gray-500">No logs today</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}