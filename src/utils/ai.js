// Simple heuristic "AI" utilities

// Timetable generator: distributes subjects to slots balancing teacher load
export function generateTimetable({ classes, subjects, teachers, slotsPerDay = 6, days = ['Mon','Tue','Wed','Thu','Fri'] }) {
  const timetable = {};
  classes.forEach(c => {
    timetable[c.id] = {};
    days.forEach(d => { timetable[c.id][d] = Array.from({ length: slotsPerDay }, () => null); });
  });
  let si = 0;
  const subs = [...subjects];
  days.forEach(d => {
    for (let sIdx = 0; sIdx < slotsPerDay; sIdx++) {
      classes.forEach(c => {
        const sub = subs[si % subs.length];
        timetable[c.id][d][sIdx] = { subjectId: sub.id, teacherId: sub.teacherId };
        si++;
      });
    }
  });
  return timetable;
}

// Dropout risk: simplistic model: low attendance + low grades
export function predictDropoutRisk({ students, attendanceByStudent, gradeAvgByStudent }) {
  return students.map(st => {
    const att = attendanceByStudent[st.id] ?? 1;
    const grade = gradeAvgByStudent[st.id] ?? 1;
    // risk between 0-1
    let risk = 0.5*(1-att) + 0.5*(1-grade);
    return { studentId: st.id, name: st.name, risk: Math.min(1, Math.max(0, risk)) };
  }).sort((a,b) => b.risk - a.risk);
}

// Simple plagiarism check: Jaccard similarity over word sets
export function plagiarismScore(textA, textB) {
  const a = new Set(textA.toLowerCase().split(/\W+/).filter(Boolean));
  const b = new Set(textB.toLowerCase().split(/\W+/).filter(Boolean));
  const inter = new Set([...a].filter(x => b.has(x))).size;
  const union = new Set([...a, ...b]).size || 1;
  return inter / union;
}