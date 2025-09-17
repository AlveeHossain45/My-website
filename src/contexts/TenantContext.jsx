import { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem } from '../utils/storage.js';
import { list } from '../utils/fakeApi.js';

const TenantContext = createContext(null);
export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ children }) {
  const [school, setSchool] = useState(() => getItem('current_school'));
  const [branch, setBranch] = useState(() => getItem('current_branch'));
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => { list('schools').then(setSchools); }, []);
  useEffect(() => {
    if (school?.id) list('branches', { schoolId: school.id }).then(setBranches);
    else setBranches([]);
  }, [school]);

  const setCurrentSchool = s => { setSchool(s); setItem('current_school', s); };
  const setCurrentBranch = b => { setBranch(b); setItem('current_branch', b); };

  return (
    <TenantContext.Provider value={{ school, branch, schools, branches, setCurrentSchool, setCurrentBranch }}>
      {children}
    </TenantContext.Provider>
  );
}