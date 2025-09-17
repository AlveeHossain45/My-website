import { useAuth } from '../../contexts/AuthContext.jsx';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

// এই ড্যাশবোর্ডটি অন্য ভূমিকাগুলোর জন্যও তৈরি করা যেতে পারে
const DefaultDashboard = () => (
  <div>
    <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
    <p className="text-gray-500 mt-1">Your relevant information will be displayed here.</p>
  </div>
);


export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Student':
        return <StudentDashboard />;
      // আপনি Parent, Librarian, ইত্যাদিদের জন্যও ড্যাশবোর্ড তৈরি করতে পারেন
      default:
        return <DefaultDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
}