// src/features/Dashboard/components/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import { list } from '../../../utils/fakeApi';
import { useAuth } from '../../../contexts/AuthContext';
import { StatCard } from './StatCard';
import { ClipboardList, Percent, Trophy, Calendar, Bell, Award, BookOpen } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ gpa: 'N/A', attendance: 0, assignments: 0 });
  const [deadlines, setDeadlines] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  
  useEffect(() => {
    (async () => {
      const [grades, attendance, assignments, classes] = await Promise.all([
        list('grades'), list('attendance'), list('assignments'), list('classes')
      ]);
      
      const myGrades = grades.filter(g => g.studentId === user.id);
      const myAttendance = attendance.filter(a => a.studentId === user.id);
      
      const avgGrade = myGrades.length ? myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length : 0;
      const gpa = (avgGrade / 100 * 4).toFixed(2);
      const presentDays = myAttendance.filter(a => a.present).length;
      const attendancePercent = myAttendance.length ? (presentDays / myAttendance.length) * 100 : 100;
      const pendingAssignments = assignments.filter(a => dayjs(a.dueDate).isAfter(dayjs())).length;

      setStats({ 
        gpa, 
        attendance: attendancePercent.toFixed(0), 
        assignments: pendingAssignments 
      });
      
      setDeadlines(assignments.filter(a => dayjs(a.dueDate).isAfter(dayjs())).slice(0, 4));
      
      // Mock upcoming classes
      const mockClasses = [
        { time: '9:00 AM', subject: 'Mathematics', room: 'Room 302' },
        { time: '11:00 AM', subject: 'Physics', room: 'Lab 105' },
        { time: '2:00 PM', subject: 'Computer Science', room: 'Lab 203' }
      ];
      setUpcomingClasses(mockClasses);
    })();
  }, [user.id]);
  
  const attendanceData = [
    { name: 'Attendance', value: parseInt(stats.attendance), fill: '#10B981' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Student Portal</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user.name.split(' ')[0]}! Here's your academic summary.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Current GPA" 
          value={stats.gpa} 
          icon={Trophy} 
          color="bg-yellow-500" 
          trend={{ value: 4.2, isPositive: parseFloat(stats.gpa) > 3.5 }}
        />
        
        <StatCard 
          title="Attendance" 
          value={`${stats.attendance}%`} 
          icon={Percent} 
          color="bg-green-500" 
          trend={{ value: 5, isPositive: parseInt(stats.attendance) > 85 }}
        />
        
        <StatCard 
          title="Upcoming Assignments" 
          value={stats.assignments} 
          icon={ClipboardList} 
          color="bg-blue-500" 
          details="Due this week: 3"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-6">Upcoming Classes</h2>
          <div className="space-y-4">
            {upcomingClasses.map((cls, index) => (
              <motion.div 
                key={index}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white">{cls.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cls.time} • {cls.room}</p>
                </div>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Details</button>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Attendance Rate</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="20%" outerRadius="100%" barSize={16} data={attendanceData}>
                  <PolarAngleAxis 
                    type="number" 
                    domain={[0, 100]} 
                    angleAxisId={0} 
                    tick={false} 
                  />
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-2xl font-bold text-gray-800 dark:text-white"
                  >
                    {stats.attendance}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Assignment Deadlines</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
          </div>
          <ul className="space-y-4">
            {deadlines.map((assignment, index) => (
              <motion.li 
                key={assignment.id}
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
                    <p className="font-medium text-gray-800 dark:text-white">{assignment.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{dayjs(assignment.dueDate).format('MMM D')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dayjs(assignment.dueDate).fromNow()}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
        
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Recent Achievements</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Top Performer in Mathematics</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Awarded yesterday</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400"/>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Perfect Attendance This Month</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Awarded 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}