import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function MyClassesPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    (async () => {
      const [subs, cls, st] = await Promise.all([list('subjects'), list('classes'), list('students')]);
      const mySubjects = subs.filter(s => s.teacherId === user.id);
      setSubjects(mySubjects);
      setClasses(cls);
      setStudents(st);
    })();
  }, [user.id]);

  const classMap = classes.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

  const grouped = subjects.reduce((acc, sub) => {
    const className = classMap[sub.classId] || 'Unknown Class';
    acc[className] = acc[className] || [];
    acc[className].push(sub.name);
    return acc;
  }, {});
  
  const studentCount = (classId) => students.filter(s => s.classId === classId).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Classes & Subjects</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {classes.map(c => {
          const classSubjects = subjects.filter(s => s.classId === c.id);
          if (classSubjects.length === 0) return null; // Only show classes with assigned subjects
          return (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-2">
              <div className="font-semibold text-lg">{c.name}</div>
              <div className="text-sm text-gray-500">Students: {studentCount(c.id)}</div>
              <div className="mt-3">
                <div className="font-medium mb-1">Teaching Subjects:</div>
                <ul className="list-disc list-inside text-sm">
                  {classSubjects.map(s => <li key={s.id}>{s.name}</li>)}
                </ul>
              </div>
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && <div className="text-sm text-gray-500">You are not currently assigned to teach any subjects.</div>}
      </div>
    </div>
  );
}