const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldState = `const [title, setTitle] = useState('');
  const [diff, setDiff] = useState<'easy'|'medium'|'hard'|'mixed'>('mixed');
  const [count, setCount] = useState(10);
  const [maxHearts, setMaxHearts] = useState<number>(3);
  const [units, setUnits] = useState<number[]>([]);

  const availableCount = (() => {
    let availableQuestions = questions;
    if (units.length > 0) {
      availableQuestions = availableQuestions.filter(q => units.includes(q.unit));
    }
    if (diff !== 'mixed') {
      availableQuestions = availableQuestions.filter(q => q.difficulty === diff);
    }
    return availableQuestions.length;
  })();

  const handleCreate = async () => {
    if (count > availableCount) {
      alert(\`錯誤：發布的任務題數 (\${count}) 大於圖庫中符合條件的題數 (\${availableCount})。請調整題數。\`);
      return;
    }

    try {
      if (editingTaskId) {
        await updateDoc(doc(db, 'tasks', editingTaskId), {
          title, targetUnits: units, difficulty: diff, questionCount: count, maxHearts: maxHearts || 0
        });
        setEditingTaskId(null);
      } else {
        await addDoc(collection(db, 'tasks'), {
          title, subject: subjectId, targetUnits: units, difficulty: diff, questionCount: count, maxHearts: maxHearts || 0, isActive: true, createdAt: Date.now()
        });
      }
      setShowForm(false);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleEditTask = (t: Task) => {
    setTitle(t.title);
    setDiff(t.difficulty);
    setCount(t.questionCount);
    setMaxHearts(t.maxHearts || 0);
    setUnits(t.targetUnits || []);
    setEditingTaskId(t.id);
    setShowForm(true);
  };`;

const newState = `const [title, setTitle] = useState('');
  const [diff, setDiff] = useState<'easy'|'medium'|'hard'|'mixed'>('mixed');
  const [mcCount, setMcCount] = useState(10);
  const [fibCount, setFibCount] = useState(10);
  const [maxHearts, setMaxHearts] = useState<number>(3);
  const [units, setUnits] = useState<number[]>([]);

  const availableMcCount = useMemo(() => {
    let q = questions.filter(x => x.type === 'multiple_choice');
    if (units.length > 0) q = q.filter(x => units.includes(x.unit));
    if (diff !== 'mixed') q = q.filter(x => x.difficulty === diff);
    return q.length;
  }, [questions, units, diff]);

  const availableFibCount = useMemo(() => {
    let q = questions.filter(x => x.type === 'fill_in_the_blank');
    if (units.length > 0) q = q.filter(x => units.includes(x.unit));
    if (diff !== 'mixed') q = q.filter(x => x.difficulty === diff);
    return q.length;
  }, [questions, units, diff]);

  const handleCreate = async () => {
    if (mcCount > availableMcCount || fibCount > availableFibCount) {
      alert(\`錯誤：題數大於圖庫中符合條件的題數。\\n選擇題: \${mcCount} / \${availableMcCount}\\n填空題: \${fibCount} / \${availableFibCount}\`);
      return;
    }

    const totalCount = mcCount + fibCount;
    if (totalCount === 0) {
      alert('請至少設定一題');
      return;
    }

    try {
      if (editingTaskId) {
        await updateDoc(doc(db, 'tasks', editingTaskId), {
          title, targetUnits: units, difficulty: diff, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts || 0
        });
        setEditingTaskId(null);
      } else {
        await addDoc(collection(db, 'tasks'), {
          title, subject: subjectId, targetUnits: units, difficulty: diff, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts || 0, isActive: true, createdAt: Date.now()
        });
      }
      setShowForm(false);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleEditTask = (t: Task) => {
    setTitle(t.title);
    setDiff(t.difficulty);
    if (t.mcCount !== undefined || t.fibCount !== undefined) {
      setMcCount(t.mcCount || 0);
      setFibCount(t.fibCount || 0);
    } else {
      setMcCount(t.questionCount);
      setFibCount(0);
    }
    setMaxHearts(t.maxHearts || 0);
    setUnits(t.targetUnits || []);
    setEditingTaskId(t.id);
    setShowForm(true);
  };`;

if (!code.includes(oldState.trim().slice(0, 100))) {
  console.error('Could not find oldState!');
} else {
  code = code.replace(oldState, newState);
}

fs.writeFileSync('src/App.tsx', code);
console.log('done updating tasks tab');
