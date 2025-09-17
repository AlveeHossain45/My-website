import { useEffect, useMemo, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import dayjs from 'dayjs';

export default function ParentOverviewPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    (async () => {
      const [st, att, gr, pay, ev, rt, bs] = await Promise.all([
        list('students'), list('attendance'), list('grades'), list('payments'), list('events'), list('transportRoutes'), list('buses')
      ]);
      setChildren(st.filter(s => s.parentId === user.id));
      setAttendance(att);
      setGrades(gr);
      setPayments(pay);
      setEvents(ev);
      setRoutes(rt);
      setBuses(bs);
    })();
  }, [user.id]);

  const summary = (child) => {
    const att = attendance.filter(a => a.studentId === child.id);
    const present = att.filter(a => a.present).length;
    const rate = att.length ? (present/att.length) : 1;
    const gs = grades.filter(g => g.studentId === child.id).map(g => Number(g.score||0));
    const gavg = gs.length ? (gs.reduce((a,b)=>a+b,0)/gs.length) : 0;
    const dues = payments.filter(p => p.studentId === child.id && p.status !== 'paid');
    const upcoming = events.find(e => dayjs(e.date).isAfter(dayjs()) && dayjs(e.date).diff(dayjs(), 'day') <= 14);
    const route = child.routeId ? routes.find(r => r.id === child.routeId) : null;
    return { rate, gavg, dues, upcoming, route };
  };

  const busPlate = (route) => buses.find(b => b.id === route.busId)?.plate || route?.busId;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Children Overview</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {children.map(ch => {
          const s = summary(ch);
          return (
            <div key={ch.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-2">
              <div className="font-semibold">{ch.name}</div>
              <div className="text-sm">Attendance: {(s.rate*100).toFixed(0)}%</div>
              <div className="text-sm">Grade average: {s.gavg.toFixed(1)}</div>
              <div className="text-sm">Fee dues: {s.dues.length}</div>
              <div className="text-sm">Upcoming: {s.upcoming ? `${s.upcoming.title} on ${s.upcoming.date}` : '—'}</div>
              <div className="text-sm">Transport: {s.route ? `${s.route.name} • Bus ${busPlate(s.route)}` : 'Not assigned'}</div>
            </div>
          );
        })}
        {children.length===0 && <div className="text-sm text-gray-500">No linked children</div>}
      </div>
    </div>
  );
}