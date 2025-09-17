import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [parent, setParent] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    (async () => {
      const [stList, parentList, classList] = await Promise.all([list('students'), list('parents'), list('classes')]);
      const myStudent = stList.find(s => s.id === user.id);
      setStudent(myStudent);
      setClasses(classList);
      if (myStudent?.parentId) {
        setParent(parentList.find(p => p.id === myStudent.parentId));
      }
    })();
  }, [user.id]);

  const className = classes.find(c => c.id === student?.classId)?.name || 'N/A';

  if (!student) return <div className="text-center p-8">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg grid md:grid-cols-3 gap-8">
        {/* ENHANCED: Profile picture and basic info section */}
        <div className="md:col-span-1 flex flex-col items-center text-center">
          <img 
            src={student.avatarUrl || `https://i.pravatar.cc/150?u=${student.id}`} 
            alt="Profile" 
            className="w-32 h-32 rounded-full ring-4 ring-brand-500/50 object-cover"
          />
          <h2 className="mt-4 text-2xl font-semibold">{student.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          <span className="mt-2 px-3 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
            {className}
          </span>
        </div>
        
        {/* ENHANCED: Detailed information section */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-semibold border-b pb-2 mb-3 flex justify-between items-center">
              <span>About Me</span>
              <button className="text-sm text-brand-600 hover:text-brand-500 flex items-center gap-1">
                <PencilSquareIcon className="w-4 h-4" /> Edit
              </button>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {student.bio || 'No bio available. Click edit to add one.'}
            </p>
          </div>
          
          {parent && (
            <div>
              <h3 className="text-xl font-semibold border-b pb-2 mb-3">Parent/Guardian Information</h3>
              <div className="space-y-2">
                <DetailRow label="Name" value={parent.name} />
                <DetailRow label="Email" value={parent.email || 'N/A'} />
                <DetailRow label="Contact" value="**********" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-styled DetailRow for a cleaner look
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}