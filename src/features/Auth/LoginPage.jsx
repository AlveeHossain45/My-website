import { useState, Fragment, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import {
  Mail, Lock, Eye, EyeOff, LoaderCircle, GraduationCap, 
  Briefcase, UserCog, Users, ArrowLeft, ChevronDown, Sparkles
} from 'lucide-react';

// Animation variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } };

// Premium Logo
const PremiumLogo = () => (
    <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="url(#logo_grad_1)"/>
                <path d="M3 7V17L12 22L21 17V7L12 12L3 7Z" fill="url(#logo_grad_2)"/>
                <defs>
                    <linearGradient id="logo_grad_1" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#60a5fa"/><stop offset="1" stopColor="#3b82f6"/></linearGradient>
                    <linearGradient id="logo_grad_2" x1="12" y1="7" x2="12" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#3b82f6"/><stop offset="1" stopColor="#1e3a8a"/></linearGradient>
                </defs>
            </svg>
        </div>
    </div>
);

// Role Data
const roles = [
    { name: 'Admin', icon: UserCog, key: 'admin', color: 'from-red-500 to-orange-500' },
    { name: 'Teacher', icon: Briefcase, key: 'teacher', color: 'from-emerald-500 to-teal-500' },
    { name: 'Student', icon: GraduationCap, key: 'student', color: 'from-blue-500 to-indigo-500' },
    { name: 'Others', icon: Users, key: 'others', color: 'from-purple-500 to-pink-500', subRoles: ['Parent', 'Librarian', 'Accountant'] },
];

// 3D Tilt Card for Role Selection
const RoleCard = ({ role, onSelect }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left - width / 2) / 20;
        const y = (clientY - top - height / 2) / 20;
        currentTarget.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
    };

    if (role.key === 'others') {
        return (
            <Menu as="div" className="relative inline-block text-left w-full">
                <Menu.Button as={motion.div} variants={itemVariants} className="w-full">
                    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`p-6 text-center text-white bg-gradient-to-br ${role.color} rounded-2xl cursor-pointer shadow-lg transition-all duration-300`} style={{ transformStyle: 'preserve-3d' }}>
                        <div style={{ transform: 'translateZ(40px)' }}>
                            <role.icon className="w-10 h-10 mx-auto mb-3" />
                            <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                                {role.name} <ChevronDown className="w-4 h-4" />
                            </h3>
                        </div>
                    </div>
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl focus:outline-none z-50">
                        <div className="p-1">
                          {role.subRoles.map(subRole => (
                            <Menu.Item key={subRole}>
                              {({ active }) => (
                                <button onClick={() => onSelect({ name: subRole, icon: Users, key: subRole.toLowerCase() })} className={`${active ? 'bg-white/10 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}>
                                  {subRole}
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        );
    }

    return (
        <motion.div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} variants={itemVariants} className={`p-6 text-center text-white bg-gradient-to-br ${role.color} rounded-2xl cursor-pointer shadow-lg transition-all duration-300`} onClick={() => onSelect(role)} style={{ transformStyle: 'preserve-3d' }}>
            <div style={{ transform: 'translateZ(40px)' }}>
                <role.icon className="w-10 h-10 mx-auto mb-3" />
                <h3 className="text-lg font-bold">{role.name}</h3>
            </div>
        </motion.div>
    );
};

// Login Form
const LoginForm = ({ role, onBack }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (data) => {
        login(data.email, data.password, role.name);
    };

    return (
        <motion.div key="login-form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
            <motion.button onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 mb-6 text-sm text-gray-300 transition-colors hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back to selection
            </motion.button>
            <div className="text-center mb-8">
                <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-4 border border-blue-500/20"><role.icon className="w-8 h-8 text-blue-300" /></div>
                <h2 className="text-2xl font-bold text-white">{role.name} Portal Login</h2>
                <p className="mt-2 text-gray-400">Enter your credentials to continue</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="relative group">
                        <Mail className="absolute w-5 h-5 top-3.5 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                        <input {...register('email', { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })} type="email" placeholder="Email Address" className="w-full py-3.5 pl-12 pr-4 text-white bg-gray-800/50 border border-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"/>
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <div>
                    <div className="relative group">
                        <Lock className="absolute w-5 h-5 top-3.5 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                        {/* --- PASSWORD VALIDATION FIXED --- */}
                        <input {...register('password', { required: "Password is required" })} type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full py-3.5 pl-12 pr-12 text-white bg-gray-800/50 border border-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition-colors hover:text-white">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3.5 text-sm font-medium text-white transition-all duration-300 transform bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /><span>Sign In</span></>}
                </button>
            </form>
        </motion.div>
    );
};

// Main Login Page Component
export default function PremiumLoginPage() {
    const [selectedRole, setSelectedRole] = useState(null);

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900"></div>
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <AnimatePresence mode="wait">
                    {!selectedRole ? (
                        <motion.div key="role-selection" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl text-center">
                            <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mb-10">
                                <PremiumLogo />
                                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">EduSys Portal</h1>
                            </motion.div>
                            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-md mx-auto">
                                The next-generation platform for educational institutions. Please select your portal to continue.
                            </motion.p>
                            <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
                                {roles.map(role => <RoleCard key={role.key} role={role} onSelect={setSelectedRole} />)}
                            </div>
                        </motion.div>
                    ) : (
                        <LoginForm role={selectedRole} onBack={() => setSelectedRole(null)} />
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animate-tilt { animation: tilt 10s infinite linear; }
                @keyframes tilt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
            `}</style>
        </div>
    );
}