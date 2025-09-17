// src/features/Dashboard/components/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { list } from '../../../utils/fakeApi';
import { StatCard } from './StatCard';
import { Users, BookCopy, DollarSign, Activity, TrendingUp, Calendar, Download, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, revenue: 0 });
  const [logs, setLogs] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activeTab, setActiveTab] = useState('monthly');
  
  useEffect(() => {
    (async () => {
      const [students, teachers, subjects, payments, auditLogs] = await Promise.all([
        list('students'), list('teachers'), list('subjects'), list('payments'), list('auditLogs')
      ]);
      
      const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        students: students.length,
        teachers: teachers.length,
        courses: subjects.length,
        revenue: totalRevenue.toLocaleString(),
      });
      
      setLogs(auditLogs.slice(0, 5));
      
      // Generate mock enrollment data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const mockEnrollmentData = months.map((month, i) => ({
        name: month,
        students: Math.floor(Math.random() * 100) + 20,
        teachers: Math.floor(Math.random() * 20) + 5
      }));
      setEnrollmentData(mockEnrollmentData);
      
      // Generate mock revenue data
      const mockRevenueData = months.map((month, i) => ({
        name: month,
        revenue: Math.floor(Math.random() * 10000) + 5000
      }));
      setRevenueData(mockRevenueData);
    })();
  }, []);

  const courseDistribution = [
    { name: 'Science', value: 35 },
    { name: 'Mathematics', value: 25 },
    { name: 'Languages', value: 20 },
    { name: 'Arts', value: 20 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Full system overview and management hub.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Download size={16} />
          Export Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.students} 
          icon={Users} 
          color="bg-blue-500" 
          trend={{ value: 12, isPositive: true }}
          details="+5 this month" 
        />
        <StatCard 
          title="Total Teachers" 
          value={stats.teachers} 
          icon={Users} 
          color="bg-green-500" 
          trend={{ value: 5, isPositive: true }}
          details="+2 this month" 
        />
        <StatCard 
          title="Active Courses" 
          value={stats.courses} 
          icon={BookCopy} 
          color="bg-yellow-500" 
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue}`} 
          icon={DollarSign} 
          color="bg-purple-500" 
          trend={{ value: 18, isPositive: true }}
          details="For this academic year" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Enrollment Trends</h2>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {['weekly', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="teachers" stroke="#10B981" fillOpacity={1} fill="url(#colorTeachers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Course Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {courseDistribution.map((entry, index) => (
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Revenue Overview</h2>
            <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Recent Activity</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
          </div>
          <ul className="space-y-4">
            {logs.map((log, index) => (
              <motion.li 
                key={log.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400"/>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{log.actor || 'System'} {log.action}d a {log.resource}.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dayjs(log.ts).fromNow()}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}