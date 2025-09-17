import { Fragment, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Menu as MenuIcon,
  X,
  Moon,
  Sun,
  ChevronDown,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import navigationConfig from '../../config/navigation.js';
import NotificationBell from '../Notifications/NotificationBell.jsx';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Sidebar Content
function NavigationContent() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userNavigation = navigationConfig.filter(group => {
    return group.roles.includes(user.role);
  });

  const handleAction = (action) => {
    if (action === 'logout') {
      logout();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-4 shrink-0">
        <h1 className="text-2xl font-bold text-white">EduSys</h1>
      </div>
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul role="list" className="space-y-1">
          {userNavigation.map((item) => (
            <li key={item.label}>
              {!item.children ? (
                <NavLink
                  to={item.action ? '#' : item.path}
                  onClick={item.action ? () => handleAction(item.action) : undefined}
                  className={({ isActive }) =>
                    classNames(
                      isActive && !item.action
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60',
                      'group flex items-center gap-x-3 rounded-md p-2.5 text-sm leading-6 font-semibold transition-colors'
                    )
                  }
                >
                  {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                  {item.label}
                </NavLink>
              ) : (
                <Disclosure as="div" defaultOpen={item.children.some(child => location.pathname.startsWith(child.path))}>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center w-full text-left p-2.5 gap-x-3 text-sm font-semibold text-gray-400 rounded-md hover:bg-gray-800/60 hover:text-white">
                        {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </Disclosure.Button>
                      <Disclosure.Panel as="ul" className="pl-6 mt-1 space-y-1">
                        {item.children.map(subItem => (
                          <li key={subItem.label}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                classNames(
                                  isActive ? 'text-white' : 'text-gray-400 hover:text-white',
                                  'block rounded-md py-2 pr-2 pl-4 text-sm leading-6'
                                )
                              }
                            >
                              {subItem.label}
                            </NavLink>
                          </li>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}


export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen text-gray-900 bg-gray-100 dark:bg-dark-primary dark:text-gray-100">
      
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16">
                <Transition.Child as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <X className="w-6 h-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-col overflow-y-auto bg-gray-900 grow">
                  <NavigationContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 md:flex-col bg-gray-900">
        <NavigationContent />
      </div>

      {/* Main content area */}
      <div className="flex flex-col min-h-screen md:pl-64">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm shrink-0 gap-x-4 dark:border-gray-700/50 dark:bg-dark-secondary/80 sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 md:hidden" onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="w-6 h-6" aria-hidden="true" />
          </button>
          
          <div className="relative flex-1">
              <Search className="absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full max-w-xs pl-10 pr-4 py-2 text-sm border rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          
          <div className="flex items-center self-stretch justify-end flex-1 gap-x-4 lg:gap-x-6">
              <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <img className="w-8 h-8 rounded-full bg-gray-50 object-cover" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User avatar" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className='font-semibold text-sm'>{user.name}</p>
                      <p className='text-xs text-gray-500'>{user.role}</p>
                    </div>
                    <Menu.Item><button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={logout}>Sign out</button></Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
          </div>
        </header>

        <main id="main" className="flex-1 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}