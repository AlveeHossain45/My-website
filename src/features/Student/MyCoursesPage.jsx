import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { BookOpenIcon } from '@heroicons/react/24/solid';

// NEW: ProgressBar component
const ProgressBar = ({ value }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-xs font-medium text-brand-700 dark:text-white">Progress</span>
      <span className="text-xs font-medium text-brand-700 dark:text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
      <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [myStudentData, setMyStudentData] = useState(null);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    (async () => {
      const [st, sub, tch] = await Promise.all([list('students'), list('subjects'), list('teachers')]);
      const mySt = st.find(s => s.id === user.id);
      if (!mySt) return;
      setMyStudentData(mySt);

      const mySubjects = sub.filter(s => s.classId === mySt.classId);
      setSubjects(mySubjects);
      setTeachers(tch);
    })();
  }, [user.id]);

  const teacherMap = teachers.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          {myStudentData && (
            <div className="text-lg text-gray-500 dark:text-gray-400">
              Class: <span className="font-semibold text-gray-800 dark:text-gray-200">{myStudentData.classId}</span>
            </div>
          )}
      </div>

      {/* ENHANCED: Grid of course cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg space-y-4 transition-transform hover:scale-105 duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{s.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taught by: {teacherMap[s.teacherId] || 'Unassigned'}</p>
              </div>
              <div className="p-2 rounded-full bg-brand-100 dark:bg-brand-900">
                <BookOpenIcon className="w-6 h-6 text-brand-600 dark:text-brand-300" />
              </div>
            </div>
            <ProgressBar value={s.progress || 0} />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm font-semibold text-brand-600 hover:text-brand-500">View Syllabus</button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && <div className="text-sm text-gray-500 md:col-span-3">No courses assigned to your class.</div>}
      </div>
    </div>
  );
}