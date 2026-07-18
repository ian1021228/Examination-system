const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const matchStr = "const [count, setCount] = useState(10);";
const idx = code.indexOf(matchStr);
if (idx === -1) {
  console.log('not found');
  process.exit(1);
}

const endStr = "setShowForm(true);\n  };";
const endIdx = code.indexOf(endStr, idx) + endStr.length;

const oldBlock = code.substring(idx, endIdx);

const newBlock = `const [mcCount, setMcCount] = useState(10);
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

code = code.substring(0, idx) + newBlock + code.substring(endIdx);

const oldToggle = `setCount(10);`;
const newToggle = `setMcCount(10); setFibCount(10);`;
code = code.replace(oldToggle, newToggle);

const oldInputs = `<div className="flex space-x-2">
                <div className="w-1/2 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">發布題數</label>
                  <input type="number" placeholder="題數" value={count || ''} onChange={e => setCount(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" />
                </div>
                <div className="w-1/2 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">容錯數量 (0為不限)</label>
                  <input type="number" placeholder="最多錯幾題(0=不限)" value={maxHearts === 0 ? '' : maxHearts} onChange={e => setMaxHearts(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" title="最多錯幾題 (愛心數量，0代表無限)" />
                </div>
            </div>`;

const newInputs = `<div className="flex space-x-2">
                <div className="w-1/3 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">選擇 ({availableMcCount})</label>
                  <input type="number" min="0" placeholder="選擇題" value={mcCount === 0 ? '' : mcCount} onChange={e => setMcCount(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" />
                </div>
                <div className="w-1/3 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">填空 ({availableFibCount})</label>
                  <input type="number" min="0" placeholder="填空題" value={fibCount === 0 ? '' : fibCount} onChange={e => setFibCount(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" />
                </div>
                <div className="w-1/3 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">容錯(0不限)</label>
                  <input type="number" placeholder="不限則填0" value={maxHearts === 0 ? '' : maxHearts} onChange={e => setMaxHearts(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" title="最多錯幾題 (愛心數量，0代表無限)" />
                </div>
            </div>`;

code = code.replace(oldInputs, newInputs);

const oldAvailableCountLabel = `<span className="text-xs text-purple-400">符合條件的題庫數量: {availableCount} 題</span>`;
const newAvailableCountLabel = `<span className="text-xs text-purple-400">選擇題 {availableMcCount} 題 | 填空題 {availableFibCount} 題</span>`;
code = code.replace(oldAvailableCountLabel, newAvailableCountLabel);

fs.writeFileSync('src/App.tsx', code);
console.log('done updating tasks tab 2');
