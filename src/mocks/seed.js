import { getItem, setItem } from '../utils/storage.js';
import { nanoid } from 'nanoid';

export function seedIfEmpty() {
  const db = getItem('db');
  if (db) return;

  const schools = [{ id: 's1', name: 'EduSys International School' }];
  const branches = [{ id: 'b1', schoolId: 's1', name: 'Main Campus' }, { id: 'b2', schoolId: 's1', name: 'North Campus' }];

  const users = [
    { id: 'u-admin-1', name: 'Alvee Hasan', email: 'alvee@edusys.com', password: 'alvee', role: 'Admin', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-admin-2', name: 'Sami Sahil', email: 'sami@edusys.com', password: 'sami', role: 'Admin', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-admin-3', name: 'Alice Admin', email: 'admin@edusys.com', password: 'admin123', role: 'Admin', active: true, schoolId: 's1', branchId: 'b1' },    
    { id: 'u-teacher', name: 'Tom Teacher', email: 'teacher@edusys.com', password: 'teacher123', role: 'Teacher', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-student', name: 'Sara Student', email: 'student@edusys.com', password: 'student123', role: 'Student', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-parent', name: 'Peter Parent', email: 'parent@edusys.com', password: 'parent123', role: 'Parent', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-librarian', name: 'Lina Librarian', email: 'librarian@edusys.com', password: 'librarian123', role: 'Librarian', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-accountant', name: 'Andy Accountant', email: 'accountant@edusys.com', password: 'accountant123', role: 'Accountant', active: true, schoolId: 's1', branchId: 'b1' },
    { id: 'u-staff', name: 'Sam Staff', email: 'staff@edusys.com', password: 'staff123', role: 'Staff', active: true, schoolId: 's1', branchId: 'b1' },
  ];


  const teachers = [{ id: 'u-teacher', name: 'Tom Teacher' }];
  const students = [
    { id: 'u-student', name: 'Sara Student', classId: 'c1', parentId: 'u-parent' },
    { id: nanoid(), name: 'Bob Learner', classId: 'c1', parentId: 'u-parent' },
    { id: nanoid(), name: 'Jane Pupil', classId: 'c1', parentId: 'u-parent' },
  ];
  const parents = [{ id: 'u-parent', name: 'Peter Parent' }];

  const classes = [{ id: 'c1', name: 'Grade 3 - A', branchId: 'b1' }];
  const subjects = [
    { id: nanoid(), name: 'Math', teacherId: 'u-teacher', classId: 'c1' },
    { id: nanoid(), name: 'Science', teacherId: 'u-teacher', classId: 'c1' },
    { id: nanoid(), name: 'English', teacherId: 'u-teacher', classId: 'c1' },
  ];

  const grades = [];
  const attendance = [];
  const assignments = [];
  const exams = [];
  const payments = [
    { id: nanoid(), studentId: 'u-student', title: 'Tuition Term 1', amount: 500, status: 'pending' },
    { id: nanoid(), studentId: 'u-student', title: 'Bus Fee', amount: 120, status: 'paid' },
  ];
  const payrolls = [];
  const books = [{ id: nanoid(), title: 'Algebra Basics', author: 'J. Doe', copies: 10 }];
  const borrows = [];
  const fines = [];
  const tasks = [{ id: nanoid(), title: 'Clean Lab 1', assignedTo: 'u-staff', due: '2025-09-30', status: 'open' }];
  const shifts = [];
  const leaves = [];
  const notifications = [];
  const messages = [];
  const inventory = [{ id: nanoid(), name: 'Projector', qty: 5 }];
  const assets = [];
  const transportRoutes = [{ id: nanoid(), name: 'Route A', busId: 'bus1' }];
  const buses = [{ id: 'bus1', plate: 'AB-1234' }];
  const hostelRooms = [{ id: nanoid(), roomNo: 'H101', capacity: 3 }];
  const canteenMenus = [{ id: nanoid(), date: '2025-09-10', items: ['Rice','Curry','Salad'] }];
  const healthRecords = [];
  const admissions = [];
  const events = [];
  const examsSeating = [];
  const transcripts = [];
  const auditLogs = [];

  setItem('db', {
    schools, branches, users, teachers, students, parents, classes, subjects,
    grades, attendance, assignments, exams, payments, payrolls,
    books, borrows, fines, tasks, shifts, leaves, notifications, messages,
    inventory, assets, transportRoutes, buses, hostelRooms, canteenMenus,
    healthRecords, admissions, events, examsSeating, transcripts, auditLogs
  });
}