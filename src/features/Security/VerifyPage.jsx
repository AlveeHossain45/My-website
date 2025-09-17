import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { list } from '../../utils/fakeApi.js';

const SECRET = 'EDUSYS_DEMO_SECRET';
const sign = (uid) => btoa(`${uid}|${SECRET}`);

export default function VerifyPage() {
  const qs = new URLSearchParams(useLocation().search);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const uid = qs.get('uid'); const sig = qs.get('sig');
      if (!uid || !sig) return setResult('invalid');
      const users = await list('users');
      const u = users.find(x => x.id === uid);
      setUser(u);
      setResult(sig === sign(uid) ? 'valid' : 'invalid');
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Verification</h1>
      {result === 'valid' && user && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 rounded p-4">
          <div className="font-semibold text-green-700 dark:text-green-300">Verified</div>
          <div className="text-sm">Name: {user.name}</div>
          <div className="text-sm">Role: {user.role}</div>
          <div className="text-xs text-gray-500">Signature matched</div>
        </div>
      )}
      {result === 'invalid' && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 rounded p-4">
          <div className="font-semibold text-red-700 dark:text-red-300">Invalid / Tampered</div>
          <div className="text-sm">Signature mismatch or missing parameters</div>
        </div>
      )}
    </div>
  );
}