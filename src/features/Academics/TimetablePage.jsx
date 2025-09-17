import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { generateTimetable } from '../../utils/ai.js';

export default function TimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [table, setTable] = useState({});
  const days = ['Mon','Tue','Wed','Thu','Fri'];

  useEffect(() => {
    (async () => {
      const [cls, subs, tchs] = await Promise.all([list('classes'), list('subjects'), list('teachers')]);
      setClasses(cls); setSubjects(subs); setTeachers(tchs);
      setTable(generateTimetable({ classes: cls, subjects: subs, teachers: tchs }));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Timetable</h1>
      {classes.map(c => (
        <div key={c.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">{c.name}</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left">Day</th>
                  {Array.from({ length: 6 }).map((_,i) => <th key={i} className="p-2">P{i+1}</th>)}
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <tr key={d} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-2 font-medium">{d}</td>
                    {table[c.id]?.[d]?.map((slot, i) => {
                      const sub = subjects.find(s => s.id === slot?.subjectId);
                      const t = teachers.find(t => t.id === slot?.teacherId);
                      return <td key={i} className="p-2">{sub?.name}<div className="text-xs text-gray-500">{t?.name}</div></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}