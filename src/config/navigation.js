// lucide-react থেকে আইকনগুলো সরাসরি ইম্পোর্ট করুন
import {
  Home,
  Users,
  BookCopy,
  BarChart4,
  Library,
  Banknote,
  Briefcase,
  GraduationCap,
  Building2,
  MessageSquare,
  FileCog,
  Settings,
  LogOut
} from 'lucide-react';

const nav = [
  // প্রতিটি আইটেমের জন্য 'icon' প্রপার্টিতে সরাসরি কম্পোনেন্ট ব্যবহার করুন
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin','Teacher','Student','Parent','Librarian','Accountant','Staff'], icon: Home },
  
  { label: 'Admin', roles: ['Admin'], children: [
    { label: 'Admissions', path: '/admin/admissions' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Roles & Permissions', path: '/admin/roles-permissions' },
    { label: 'Calendar', path: '/admin/calendar' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Audit Logs', path: '/admin/audit-logs' },
  ]},

  { label: 'Teacher', roles: ['Teacher','Admin'], children: [
    // ... অন্যান্য মেনু ...
  ]},
  
  // ... (বাকি সব মেনু আইটেমের জন্য icon: IconName এভাবে যোগ করুন) ...
  // উদাহরণস্বরূপ:
  { label: 'Students', path: '/student/profile', roles: ['Student','Admin'], icon: Users },
  { label: 'Library', path: '/library/catalog', roles: ['Librarian','Admin'], icon: Library },
  { label: 'Finance', path: '/finance/fees-setup', roles: ['Accountant','Admin'], icon: Banknote },
  
  // নিচে একটি সম্পূর্ণ উদাহরণ দেওয়া হলো
];

// নিচে একটি সম্পূর্ণ ম্যাপ করা উদাহরণ দেওয়া হলো যা আপনি ব্যবহার করতে পারেন
const fullNav = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin','Teacher','Student','Parent','Librarian','Accountant','Staff'], icon: Home },

  { label: 'Admin', roles: ['Admin'], icon: Settings, children: [
    { label: 'Admissions', path: '/admin/admissions' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Roles & Permissions', path: '/admin/roles-permissions' },
    { label: 'Calendar', path: '/admin/calendar' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Audit Logs', path: '/admin/audit-logs' },
  ]},

  { label: 'Teacher', roles: ['Teacher','Admin'], icon: Briefcase, children: [
    { label: 'My Classes', path: '/teacher/classes' },
    { label: 'Lesson Planner', path: '/teacher/lesson-planner' },
    { label: 'Attendance', path: '/teacher/attendance' },
    { label: 'Gradebook', path: '/teacher/gradebook' },
    { label: 'Assignments', path: '/teacher/assignments' },
    { label: 'Performance', path: '/teacher/performance' },
    { label: 'Communication', path: '/teacher/communication' },
  ]},

  { label: 'Student', roles: ['Student','Admin'], icon: GraduationCap, children: [
    { label: 'Profile', path: '/student/profile' },
    { label: 'Courses', path: '/student/courses' },
    { label: 'Homework', path: '/student/homework' },
    { label: 'Exams', path: '/student/exams' },
    { label: 'Results', path: '/student/results' },
    { label: 'Fees', path: '/student/fees' },
    { label: 'Resources', path: '/student/resources' },
  ]},

  { label: 'Parent', roles: ['Parent','Admin'], icon: Users, children: [
    { label: 'Overview', path: '/parent/overview' },
    { label: 'Payments', path: '/parent/payments' },
    { label: 'Messages', path: '/parent/messages' },
    { label: 'Transport', path: '/parent/transport' },
  ]},

  { label: 'Library', roles: ['Librarian','Admin'], icon: Library, children: [
    { label: 'Catalog', path: '/library/catalog' },
    { label: 'Circulation', path: '/library/circulation' },
    { label: 'Fines', path: '/library/fines' },
  ]},

  { label: 'Finance', roles: ['Accountant','Admin'], icon: Banknote, children: [
    { label: 'Fees Setup', path: '/finance/fees-setup' },
    { label: 'Transactions', path: '/finance/transactions' },
    { label: 'Payroll', path: '/finance/payroll' },
    { label: 'Reports', path: '/finance/reports' },
  ]},

  { label: 'Academics', roles: ['Admin','Teacher'], icon: BookCopy, children: [
    { label: 'Timetable', path: '/academics/timetable' },
    { label: 'Subjects', path: '/academics/subjects' },
    { label: 'Exams', path: '/academics/exams' },
    { label: 'Seating Plan', path: '/academics/seating' },
    { label: 'Transcripts', path: '/academics/transcripts' },
  ]},
];

// এই লাইনটি আসল, উপরের fullNav শুধু উদাহরণ
export default fullNav;