import navigation from '../config/navigation.js';

// Lazy imports to keep initial bundle smaller
import AdmissionsPage from '../features/Admin/AdmissionsPage.jsx';
import UsersPage from '../features/Admin/UsersPage.jsx';
import RolesPermissionsPage from '../features/Admin/RolesPermissionsPage.jsx';
import CalendarPage from '../features/Admin/CalendarPage.jsx';
import NotificationsPage from '../features/Admin/NotificationsPage.jsx';
import AuditLogsPage from '../features/Admin/AuditLogsPage.jsx';

import MyClassesPage from '../features/Teacher/MyClassesPage.jsx';
import LessonPlannerPage from '../features/Teacher/LessonPlannerPage.jsx';
import TeacherAttendancePage from '../features/Teacher/AttendancePage.jsx';
import GradebookPage from '../features/Teacher/GradebookPage.jsx';
import AssignmentsPage from '../features/Teacher/AssignmentsPage.jsx';
import PerformancePage from '../features/Teacher/PerformancePage.jsx';
import TeacherCommPage from '../features/Teacher/CommunicationPage.jsx';

import StudentProfilePage from '../features/Student/MyProfilePage.jsx';
import StudentCoursesPage from '../features/Student/MyCoursesPage.jsx';
import StudentHomeworkPage from '../features/Student/HomeworkPage.jsx';
import StudentExamsPage from '../features/Student/ExamsPage.jsx';
import StudentResultsPage from '../features/Student/ResultsPage.jsx';
import StudentFeesPage from '../features/Student/FeesPage.jsx';
import StudentResourcesPage from '../features/Student/ResourcesPage.jsx';

import ParentOverviewPage from '../features/Parent/ChildOverviewPage.jsx';
import ParentPaymentsPage from '../features/Parent/PaymentsPage.jsx';
import ParentMessagesPage from '../features/Parent/MessagesPage.jsx';
import ParentTransportPage from '../features/Parent/TransportPage.jsx';

import CatalogPage from '../features/Librarian/CatalogPage.jsx';
import CirculationPage from '../features/Librarian/CirculationPage.jsx';
import FinesPage from '../features/Librarian/FinesPage.jsx';

import FeesSetupPage from '../features/Accountant/FeesSetupPage.jsx';
import TransactionsPage from '../features/Accountant/TransactionsPage.jsx';
import PayrollPage from '../features/Accountant/PayrollPage.jsx';
import FinanceReportsPage from '../features/Accountant/ReportsPage.jsx';

import StaffShiftsPage from '../features/Staff/ShiftsPage.jsx';
import StaffTasksPage from '../features/Staff/TasksPage.jsx';
import StaffLeavesPage from '../features/Staff/LeavesPage.jsx';

import TimetablePage from '../features/Academics/TimetablePage.jsx';
import SubjectsPage from '../features/Academics/SubjectsPage.jsx';
import ExamsPage from '../features/Academics/ExamsPage.jsx';
import SeatingPlanPage from '../features/Academics/SeatingPlanPage.jsx';
import TranscriptsPage from '../features/Academics/TranscriptsPage.jsx';

import HostelPage from '../features/Facilities/HostelPage.jsx';
import TransportPage from '../features/Facilities/TransportPage.jsx';
import CanteenPage from '../features/Facilities/CanteenPage.jsx';
import InventoryPage from '../features/Facilities/InventoryPage.jsx';
import HealthPage from '../features/Facilities/HealthPage.jsx';

import AnnouncementsPage from '../features/Communication/AnnouncementsPage.jsx';
import ChatPage from '../features/Communication/ChatPage.jsx';
import VideoPage from '../features/Communication/VideoPage.jsx';

import ReportsBuilderPage from '../features/Reports/BuilderPage.jsx';
import AnalyticsPage from '../features/Reports/AnalyticsPage.jsx';

// Map nav items to route config
const routeMap = {
  '/admin/admissions': AdmissionsPage,
  '/admin/users': UsersPage,
  '/admin/roles-permissions': RolesPermissionsPage,
  '/admin/calendar': CalendarPage,
  '/admin/notifications': NotificationsPage,
  '/admin/audit-logs': AuditLogsPage,

  '/teacher/classes': MyClassesPage,
  '/teacher/lesson-planner': LessonPlannerPage,
  '/teacher/attendance': TeacherAttendancePage,
  '/teacher/gradebook': GradebookPage,
  '/teacher/assignments': AssignmentsPage,
  '/teacher/performance': PerformancePage,
  '/teacher/communication': TeacherCommPage,

  '/student/profile': StudentProfilePage,
  '/student/courses': StudentCoursesPage,
  '/student/homework': StudentHomeworkPage,
  '/student/exams': StudentExamsPage,
  '/student/results': StudentResultsPage,
  '/student/fees': StudentFeesPage,
  '/student/resources': StudentResourcesPage,

  '/parent/overview': ParentOverviewPage,
  '/parent/payments': ParentPaymentsPage,
  '/parent/messages': ParentMessagesPage,
  '/parent/transport': ParentTransportPage,

  '/library/catalog': CatalogPage,
  '/library/circulation': CirculationPage,
  '/library/fines': FinesPage,

  '/finance/fees-setup': FeesSetupPage,
  '/finance/transactions': TransactionsPage,
  '/finance/payroll': PayrollPage,
  '/finance/reports': FinanceReportsPage,

  '/staff/shifts': StaffShiftsPage,
  '/staff/tasks': StaffTasksPage,
  '/staff/leaves': StaffLeavesPage,

  '/academics/timetable': TimetablePage,
  '/academics/subjects': SubjectsPage,
  '/academics/exams': ExamsPage,
  '/academics/seating': SeatingPlanPage,
  '/academics/transcripts': TranscriptsPage,

  '/facilities/hostel': HostelPage,
  '/facilities/transport': TransportPage,
  '/facilities/canteen': CanteenPage,
  '/facilities/inventory': InventoryPage,
  '/facilities/health': HealthPage,

  '/comm/announcements': AnnouncementsPage,
  '/comm/chat': ChatPage,
  '/comm/video': VideoPage,

  '/reports/builder': ReportsBuilderPage,
  '/reports/analytics': AnalyticsPage,
};

export default Object.keys(routeMap).map(path => ({ path, element: routeMap[path] }));