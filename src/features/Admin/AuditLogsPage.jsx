import { useEffect, useState, Fragment } from 'react';
import { list } from '../../utils/fakeApi.js';
import dayjs from 'dayjs';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

// Helper function to get a color based on the action type
function getActionBadgeColor(action) {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { 
    list('auditLogs').then(data => setLogs(data.sort((a,b) => dayjs(b.ts).valueOf() - dayjs(a.ts).valueOf()))); 
  }, []);
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
      <p className="text-sm text-gray-500">
        This page shows a log of all create, update, and delete actions performed in the system.
      </p>
      
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold text-left">Time</th>
                <th scope="col" className="px-6 py-3 font-semibold text-left">Actor</th>
                <th scope="col" className="px-6 py-3 font-semibold text-left">Resource</th>
                <th scope="col" className="px-6 py-3 font-semibold text-left">Action</th>
                <th scope="col" className="px-6 py-3 font-semibold text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map(log => (
                <Fragment key={log.id}>
                  {/* The compact, visible row */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">{dayjs(log.ts).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{log.actor || 'System'}</td>
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{log.resource}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* The Disclosure component handles the expand/collapse logic */}
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline">
                              <span>View Data</span>
                              <ChevronUpIcon className={`${open ? '' : 'rotate-180 transform'} h-4 w-4 transition-transform`} />
                            </Disclosure.Button>

                            {/* The collapsible panel with a smooth transition */}
                            <Transition
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                            >
                              <Disclosure.Panel as="div" className="mt-2">
                                <pre className="max-w-lg p-3 text-xs whitespace-pre-wrap bg-gray-100 rounded-md dark:bg-gray-900">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </Disclosure.Panel>
                            </Transition>
                          </>
                        )}
                      </Disclosure>
                    </td>
                  </tr>
                </Fragment>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No audit logs found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}