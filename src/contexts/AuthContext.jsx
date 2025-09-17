import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem, setItem, removeItem } from '../utils/storage.js';
import { getUserByEmail } from '../services/usersService.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getItem('auth_user'));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- UPDATED LOGIN FUNCTION WITH ROLE CHECK ---
  const login = async (email, password, expectedRole) => {
    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      
      const u = await getUserByEmail(email);

      // 1. Check if user exists
      if (!u) {
        toast.error('No user found with this email.');
        return false;
      }
      
      // 2. Check if the user's role matches the selected portal
      if (u.role.toLowerCase() !== expectedRole.toLowerCase()) {
        toast.error(`Access Denied: This user is not a ${expectedRole}.`);
        return false;
      }
      
      // 3. Check password
      if (u.password !== password) {
        toast.error('Incorrect password.');
        return false;
      }
      
      const authUser = { id: u.id, name: u.name, email: u.email, role: u.role, schoolId: u.schoolId, branchId: u.branchId };
      setUser(authUser);
      setItem('auth_user', authUser);
      toast.success(`Welcome to the ${expectedRole} portal, ${u.name.split(' ')[0]}!`);
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error("An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeItem('auth_user');
    navigate('/login');
  };

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user, isLoading }), [user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}