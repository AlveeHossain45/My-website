// src/features/Dashboard/components/ParentDashboard.jsx
import { useEffect, useState } from 'react';
import { list } from '../../../utils/fakeApi';
import { useAuth } from '../../../contexts/AuthContext';
import { StatCard } from './StatCard';
import { TrendingUp, TrendingDown, BookOpen, Award, Bell, Calendar, MessageCircle, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  useEffect(() => {
    (async () => {
      const [students, gradesData, attendanceData, events] = await Promise.all([
        list('students'), list('grades'), list('attendance'), list('events')
      ]);
      
      // For demo purposes, assume parent has access to all students
      setChildren(students.slice(0, 3));
      setSelectedChild(students[0]);
      
      const childGrades = gradesData.filter(g => g.studentId === students[0].id);
      setGrades(childGrades);
      
      const childAttendance = attendanceData.filter(a => a.studentId === students[0].id);
      setAttendance(childAttendance);
      
      // Filter upcoming events
      const upcoming = events.filter(e => dayjs(e.date).isAfter(dayjs())).slice(0, 5);
      setUpcomingEvents(upcoming);
    })();
  }, [user.id]);
  
  const gradeData = [
    { subject: 'Math', grade: 92 },
    { subject: 'Science', grade: 88 },
    { subject: 'English', grade: 95 },
    { subject: 'History', grade: 78 },
    { subject: 'Art', grade: 85 }
  ];
  
  const attendanceData = [
    { day: 'Mon', present: true },
    { day: 'Tue', present: true },
    { day: 'Wed', present: false },
    { day: 'Thu', present: true },
    { day: 'Fri', present: true }
  ];
  
  const performanceData = [
    { month: 'Jan', grade: 85 },
    { month: 'Feb', grade: 82 },
    { month: 'Mar', grade: 88 },
    { month: 'Apr', grade: 90 },
    { month: 'May', grade: 92 },
    { month: 'Jun', grade: 94 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Parent Portal</h1>
          <p className="text-gray-500 mt-1">Track your children's academic progress and activities.</p>
        </div>
        
        <div className="flex gap-2">
          {children.map(child => (
            <motion.button
              key={child.id}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedChild?.id === child.id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              onClick={() => setSelectedChild(child)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={16} />
              {child.name.split(' ')[0]}
            </motion.button>
          ))}
        </div>
      </div>
      
      {selectedChild && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Overall GPA" 
              value="3.8" 
              icon={TrendingUp} 
              color="bg-green-500" 
              trend={{ value: 5, isPositive: true }}
              details="Out of 4.0 scale" 
            />
            <StatCard 
              title="Attendance Rate" 
              value="92%" 
              icon={BookOpen} 
              color="bg-blue-500" 
              trend={{ value: 2, isPositive: true }}
              details="This semester" 
            />
            <StatCard 
              title="Assignments Completed" 
              value="42/48" 
              icon={Award} 
              color="bg-purple-500" 
              trend={{ value: 8, isPositive: true }}
              details="87% completion rate" 
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-6">Academic Performance Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grade" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Subject Grades</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="grade"
                        label={({ subject, grade }) => `${subject}: ${grade}%`}
                      >
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-white">This Week's Attendance</h2>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View full report</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {attendanceData.map((day, index) => (
                  <motion.div 
                    key={index}
                    className={`p-3 rounded-lg text-center ${day.present ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm mt-1">{day.present ? 'Present' : 'Absent'}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Upcoming School Events</h2>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
              </div>
              <ul className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.li 
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400"/>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{event.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{dayjs(event.date).format('MMM D')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dayjs(event.date).fromNow()}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Teacher Communications</h2>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3 mt-1">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Mathematics Progress Report</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From: Mrs. Johnson - Mathematics Teacher</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3 mt-1">
                    <Bell className="w-5 h-5 text-green-600 dark:text-green-400"/>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Science Fair Reminder</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From: Mr. Davis - Science Department</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.button 
                  className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-2">
                    <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Message Teacher</span>
                </motion.button>
                
                <motion.button 
                  className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400"/>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">View Calendar</span>
                </motion.button>
                
                <motion.button 
                  className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                    <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">View Report Card</span>
                </motion.button>
                
                <motion.button 
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Set Alerts</span>
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}