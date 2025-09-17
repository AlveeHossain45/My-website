import { ROLES, PERMISSIONS, can } from '../../utils/permissions.js';
import { CheckIcon } from '@heroicons/react/24/solid';

// Collect all unique permissions for display, ensuring a consistent order
const allPermissions = Array.from(new Set(Object.values(PERMISSIONS).flat().filter(p => p !== '*')));
allPermissions.sort();

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
      <p className="max-w-2xl text-sm text-gray-500">
        This table visualizes the access granted to each predefined role. To manage which user has which role, please use the 'Admin' &gt; 'Users' page.
      </p>

      {/* The main container for the table, enabling overflow for scrolling */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {/* 1. This is the sticky Role header */}
                  <th
                    scope="col"
                    className="sticky left-0 z-10 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3.5 text-left text-sm font-semibold"
                  >
                    Role
                  </th>
                  {/* 2. These are the new vertical permission headers */}
                  {allPermissions.map(p => (
                    <th
                      key={p}
                      scope="col"
                      className="h-32 p-2 text-sm font-semibold text-left border-b border-gray-300 dark:border-gray-600"
                    >
                      <div className="text-gray-600 transform -rotate-90 whitespace-nowrap dark:text-gray-300">
                        {p}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role, roleIdx) => (
                  <tr key={role} className={roleIdx % 2 === 0 ? undefined : 'bg-gray-50 dark:bg-gray-800/50'}>
                    {/* 3. This is the sticky Role cell for each row */}
                    <td
                      className="sticky left-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-sm font-medium"
                    >
                      {role}
                    </td>
                    {allPermissions.map(permission => {
                      // 4. Corrected logic to properly check permissions
                      const hasPermission = can({ role }, permission);
                      return (
                        <td
                          key={`${role}-${permission}`}
                          className="border-b border-gray-200 dark:border-gray-700 p-3.5 text-center"
                        >
                          {hasPermission && <CheckIcon className="w-5 h-5 mx-auto text-green-500" />}
                        </td>

                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}