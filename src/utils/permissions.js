export const ROLES = ['Admin','Teacher','Student','Parent','Librarian','Accountant','Staff'];

export const PERMISSIONS = {
  Admin: ['*'],
  Teacher: [
    'view:students','edit:grades','view:attendance','edit:attendance',
    'create:assignments','view:performance','message:students','message:parents'
  ],
  Student: ['view:courses','submit:assignments','view:grades','pay:fees','message:teachers'],
  Parent: ['view:child','pay:fees','message:teachers','view:transport','view:results'],
  Librarian: ['manage:library','issue:books','return:books','manage:fines'],
  Accountant: ['manage:fees','collect:fees','manage:payroll','view:finance'],
  Staff: ['view:tasks','update:tasks','manage:shifts','request:leave']
};

export function can(user, permission) {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  const perms = PERMISSIONS[user.role] || [];
  return perms.includes(permission);
}