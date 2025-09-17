// src/features/Dashboard/components/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { list } from '../../../utils/fakeApi';
import { useAuth } from '../../../contexts/AuthContext';
import { StatCard } from './StatCard';
import { Users, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, classes: 0, grading: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [classPerformance, setClassPerformance] = useState([]);
  
  useEffect(() => {
    (async () => {
      const [students, classes, assignments, submissions] = await Promise.all([
        list('students'), list('classes'), list('assignments'), list('submissions')
      ]);
      
      const myClasses = classes.filter(c => c.teacherId === user.id);
      const myStudents = students.filter(s => myClasses.some(c => c.students.includes(s.id)));
      const myAssignments = assignments.filter(a => myClasses.some(c => c.id === a.classId));
      const pendingGrading = submissions.filter(s => s.status === 'submitted' && myAssignments.some(a => a.id === s.assignmentId));
      
      setStats({ 
        students: myStudents.length, 
        classes: myClasses.length, 
        grading: pendingGrading.length 
      });
      
      setRecentSubmissions(pendingGrading.slice(0, 5));
      
      // Mock class performance data
      const mockClassPerformance = myClasses.map(c => ({
        name: c.name,
        avgScore: Math.floor(Math.random() * 40) + 60,
        students: c.students.length
      }));
      setClassPerformance(mockClassPerformance);
    })();
  }, [user.id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Teacher Portal</h1>
        <p className="text-gray-500 mt-1">Welcome, Professor {user.name.split(' ')[0]}! Here's your teaching overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.students} 
          icon={Users} 
          color="bg-blue-500" 
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatCard 
          title="Active Classes" 
          value={stats.classes} 
          icon={BookOpen} 
          color="bg-green-500" 
          details="This semester"
        />
        
        <StatCard 
          title="Pending Grading" 
          value={stats.grading} 
          icon={Clock} 
          color="bg-yellow-500" 
          details="Due this week: 12"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-6">Class Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'avgScore') return [value, 'Average Score'];
                    return [value, 'Students'];
                  }}
                />
                <Bar dataKey="avgScore" name="Average Score" radius={[4, 4, 0, 0]}>
                  {classPerformance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avgScore >= 80 ? '#10B981' : entry.avgScore >= 70 ? '#F59E0B' : '#EF4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Recent Submissions</h2>
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
            </div>
            <ul className="space-y-4">
              {recentSubmissions.map((submission, index) => (
                <motion.li 
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{submission.assignmentName || 'Assignment'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">By {submission.studentName || 'Student'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{dayjs(submission.submittedAt).format('MMM D')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dayjs(submission.submittedAt).fromNow()}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">Send Announcement</span>
            </motion.button>
            
            <motion.button 
              className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400"/>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">Create Assignment</span>
            </motion.button>
            
            <motion.button 
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">Grade Assignments</span>
            </motion.button>
            
            <motion.button 
              className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">Manage Classes</span>
            </motion.button>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Upcoming Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Mathematics 101</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">9:00 AM - 10:30 AM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Room 302</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Advanced Calculus</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">11:00 AM - 12:30 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Room 405</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Office Hours</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2:00 PM - 4:00 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Office 207</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}