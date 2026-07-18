const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf('export function TasksTab');
const endIdx = code.indexOf('export function AIGeneratorTab');

const replacement = `export function TasksTab({ tasks, subjectId, onRefresh, config, questions = [] }: { tasks: Task[], subjectId: Subject, onRefresh: () => void, config: SubjectConfig, questions?: Question[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [diff, setDiff] = useState<'easy'|'medium'|'hard'|'mixed'>('mixed');
  const [gameMode, setGameMode] = useState<'normal'|'survival'|'speed'>('normal');
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
          title, targetUnits: units, difficulty: diff, gameMode, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts || 0
        });
        setEditingTaskId(null);
      } else {
        await addDoc(collection(db, 'tasks'), {
          title, subject: subjectId, targetUnits: units, difficulty: diff, gameMode, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts || 0, isActive: true, createdAt: Date.now()
        });
      }
      setShowForm(false);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleEditTask = (t: Task) => {
    setTitle(t.title);
    setDiff(t.difficulty);
    setGameMode(t.gameMode || 'normal');
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
  };

  const toggleUnit = (u: number) => {
    if (units.includes(u)) setUnits(units.filter(x => x !== u));
    else setUnits([...units, u]);
  };

  const toggleTaskActive = async (t: Task) => {
    await updateDoc(doc(db, 'tasks', t.id), { isActive: !t.isActive });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-xl font-bold text-[#4A3F35]">任務列表</h3>
        <button onClick={() => {
            if (showForm) {
                setShowForm(false);
                setEditingTaskId(null);
            } else {
                setTitle(''); setDiff('mixed'); setGameMode('normal'); setMcCount(10); setFibCount(10); setUnits([]); setMaxHearts(3);
                setShowForm(true);
            }
        }} className="bg-[#C2A878] hover:bg-[#B39969] px-4 py-2 rounded-lg text-[#4A3F35] font-bold text-sm">
          {showForm ? '取消' : '新增任務'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl space-y-4 shadow-sm border border-[#EAE6DF]">
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-[#8C7A6B]">任務標題</label>
            <input type="text" placeholder="任務標題 (e.g. 第一次段考模擬)" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded-lg px-4 py-2 text-[#4A3F35]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[#8C7A6B]">難度設定</label>
              <select value={diff} onChange={e => setDiff(e.target.value as any)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]">
                <option value="mixed">混合難度</option><option value="easy">簡單</option><option value="medium">中等</option><option value="hard">困難</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[#8C7A6B]">挑戰模式</label>
              <select value={gameMode} onChange={e => setGameMode(e.target.value as any)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]">
                <option value="normal">一般模式</option>
                <option value="survival">生存模式 (無限題, 愛心耗盡即結束)</option>
                <option value="speed">計時速答 (每題10秒)</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-xs text-[#8C7A6B]">包含單元 (留空表示全範圍)</label>
            <div className="flex flex-wrap gap-2">
              {Array.from({length: config.totalUnits || 10}, (_, i) => i + 1).map(u => (
                <button
                  key={u}
                  onClick={() => toggleUnit(u)}
                  className={\`px-3 py-1 rounded-full text-xs font-bold \${units.includes(u) ? 'bg-[#4A3F35] text-white' : 'bg-[#EAE2D3] text-[#8C7A6B] hover:bg-[#D5CFC4]'}\`}
                >
                  單元 {u}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[#8C7A6B]">選擇題數 (庫存: {availableMcCount})</label>
              <input type="number" min="0" value={mcCount} onChange={e => setMcCount(parseInt(e.target.value)||0)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[#8C7A6B]">填空題數 (庫存: {availableFibCount})</label>
              <input type="number" min="0" value={fibCount} onChange={e => setFibCount(parseInt(e.target.value)||0)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-[#8C7A6B]">生命值限制 (愛心)</label>
              <input type="number" min="0" placeholder="無限請填0" value={maxHearts} onChange={e => setMaxHearts(parseInt(e.target.value)||0)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]" />
            </div>
          </div>

          <button onClick={handleCreate} className="w-full bg-[#4A3F35] hover:bg-[#5A4F45] text-white font-bold py-3 rounded-lg mt-4 transition-colors">
            {editingTaskId ? '儲存修改' : '建立任務'}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {tasks.map(t => (
          <div key={t.id} className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-sm relative group hover:border-[#C2A878] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#4A3F35] group-hover:text-[#B39969] transition-colors">{t.title}</h4>
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleTaskActive(t)} className={\`text-xs px-2 py-1 rounded font-bold \${t.isActive ? 'bg-[#8F9A8A] text-white' : 'bg-[#D5CFC4] text-[#8C7A6B]'}\`}>
                  {t.isActive ? '進行中' : '已關閉'}
                </button>
              </div>
            </div>
            <div className="text-sm text-[#8C7A6B] space-y-1">
              <p>模式: {t.gameMode === 'survival' ? '生存' : t.gameMode === 'speed' ? '速答' : '一般'}</p>
              <p>總題數: {t.questionCount} (選擇 {t.mcCount}, 填空 {t.fibCount})</p>
              <p>難度: {t.difficulty === 'mixed' ? '混合' : t.difficulty === 'easy' ? '簡單' : t.difficulty === 'medium' ? '中等' : '困難'}</p>
              <p>範圍: {t.targetUnits?.length ? t.targetUnits.join(', ') : '全部單元'}</p>
              <p>愛心: {t.maxHearts ? t.maxHearts : '無限'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#EAE6DF] flex justify-end space-x-2">
                <button onClick={() => handleEditTask(t)} className="text-sm px-3 py-1 bg-[#EAE2D3] text-[#8C7A6B] hover:text-[#4A3F35] rounded font-bold transition-colors">編輯</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-[#A69B8F] col-span-2">尚無任務</p>}
      </div>
    </div>
  );
}

export function QuestionsTab({ questions, onRefresh, subjectId }: { questions: Question[], onRefresh: () => void, subjectId: Subject }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [newUnit, setNewUnit] = useState(1);
  const [newDiff, setNewDiff] = useState<'easy'|'medium'|'hard'>('medium');
  const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image'|'youtube'|'audio'>('image');
  const [newExplanation, setNewExplanation] = useState('');

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState('');
  const [editUnit, setEditUnit] = useState(1);
  const [editDiff, setEditDiff] = useState<'easy'|'medium'|'hard'>('medium');
  const [editType, setEditType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editMediaType, setEditMediaType] = useState<'image'|'youtube'|'audio'>('image');
  const [editExplanation, setEditExplanation] = useState('');

  const handleAdd = async () => {
    if (!newPrompt || !newAnswer) return alert('請填寫題目與答案');
    const options = newOptions.split(',').map(s => s.trim()).filter(s => s);
    if (newType === 'multiple_choice' && options.length === 0) return alert('選擇題需有選項');
    if (newType === 'multiple_choice' && !options.includes(newAnswer)) return alert('正確答案必須在選項中');

    try {
      await addDoc(collection(db, 'questions'), {
        subject: subjectId,
        unit: newUnit,
        difficulty: newDiff,
        type: newType,
        prompt: newPrompt,
        options: newType === 'multiple_choice' ? options : undefined,
        correctAnswer: newAnswer,
        mediaUrl: newMediaUrl,
        mediaType: newMediaType,
        explanation: newExplanation
      });
      setShowAddForm(false);
      setNewPrompt(''); setNewAnswer(''); setNewOptions(''); setNewMediaUrl(''); setNewExplanation('');
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.correctAnswer);
    setEditOptions(q.options ? q.options.join(', ') : '');
    setEditUnit(q.unit);
    setEditDiff(q.difficulty);
    setEditType(q.type || 'multiple_choice');
    setEditMediaUrl(q.mediaUrl || '');
    setEditMediaType(q.mediaType || 'image');
    setEditExplanation(q.explanation || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editPrompt || !editAnswer) return;
    const options = editOptions.split(',').map(s => s.trim()).filter(s => s);
    try {
      await updateDoc(doc(db, 'questions', editingId), {
        unit: editUnit,
        difficulty: editDiff,
        type: editType,
        prompt: editPrompt,
        options: editType === 'multiple_choice' ? options : null,
        correctAnswer: editAnswer,
        mediaUrl: editMediaUrl,
        mediaType: editMediaType,
        explanation: editExplanation
      });
      setEditingId(null);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === questions.length) setSelectedQuestions([]);
    else setSelectedQuestions(questions.map(q => q.id));
  };

  const toggleSelectQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) setSelectedQuestions(selectedQuestions.filter(x => x !== id));
    else setSelectedQuestions([...selectedQuestions, id]);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('確定刪除？')) return;
    try {
      await deleteDoc(doc(db, 'questions', id));
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    if(!confirm(\`確定刪除 \${selectedQuestions.length} 題？\`)) return;
    try {
      for (const id of selectedQuestions) {
        await deleteDoc(doc(db, 'questions', id));
      }
      setSelectedQuestions([]);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-xl font-bold text-[#4A3F35]">題庫管理 (共 {questions.length} 題)</h3>
        <div className="space-x-2">
          {selectedQuestions.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-[#B65D48] hover:bg-[#8B4534] text-white px-3 py-1 rounded-lg text-sm transition-colors">
              刪除選中 ({selectedQuestions.length})
            </button>
          )}
          <button onClick={() => setShowAddForm(true)} className="bg-[#C2A878] hover:bg-[#B39969] text-[#4A3F35] font-bold px-4 py-2 rounded-lg text-sm">
            新增題目
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 mb-4 shadow-sm text-sm">
          <h4 className="font-bold text-[#4A3F35] mb-3 border-b border-[#EAE6DF] pb-2">新增題目</h4>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div><label className="text-xs text-[#8C7A6B]">單元</label><input type="number" value={newUnit} onChange={e => setNewUnit(parseInt(e.target.value)||1)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            <div><label className="text-xs text-[#8C7A6B]">難度</label><select value={newDiff} onChange={e => setNewDiff(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="easy">簡單</option><option value="medium">中等</option><option value="hard">困難</option></select></div>
            <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-[#8C7A6B]">多媒體 URL (選填)</label><input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" placeholder="圖片或YouTube網址" /></div>
            <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={newMediaType} onChange={e => setNewMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
          </div>
          <div><label className="text-xs text-[#8C7A6B]">題目內容</label><input value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入題目..." /></div>
          <div><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={newAnswer} onChange={e => setNewAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入正確答案..." /></div>
          {newType === 'multiple_choice' && (
            <div><label className="text-xs text-[#8C7A6B]">選項 (逗號分隔)</label><input value={newOptions} onChange={e => setNewOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="A, B, C, D" /></div>
          )}
          <div><label className="text-xs text-[#8C7A6B]">詳解 (選填)</label><textarea value={newExplanation} onChange={e => setNewExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入詳解..." rows={2} /></div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-[#EAE6DF]">
            <button onClick={() => setShowAddForm(false)} className="text-[#8C7A6B] hover:text-[#4A3F35] px-3 py-1 font-bold">取消</button>
            <button onClick={handleAdd} className="bg-[#4A3F35] hover:bg-[#5A4F45] text-white font-bold px-4 py-2 rounded-lg">確認新增</button>
          </div>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h4 className="font-serif font-bold text-xl text-[#4A3F35] mb-4">編輯題目</h4>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div><label className="text-xs text-[#8C7A6B]">單元</label><input type="number" value={editUnit} onChange={e => setEditUnit(parseInt(e.target.value)||1)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
              <div><label className="text-xs text-[#8C7A6B]">難度</label><select value={editDiff} onChange={e => setEditDiff(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="easy">簡單</option><option value="medium">中等</option><option value="hard">困難</option></select></div>
              <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={editType} onChange={e => setEditType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-[#8C7A6B]">多媒體 URL</label><input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
              <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={editMediaType} onChange={e => setEditMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
            </div>
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">題目內容</label><input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            {editType === 'multiple_choice' && (
              <div className="mb-3"><label className="text-xs text-[#8C7A6B]">選項</label><input value={editOptions} onChange={e => setEditOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            )}
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">詳解</label><textarea value={editExplanation} onChange={e => setEditExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" rows={2} /></div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-[#EAE6DF]">
              <button onClick={() => setEditingId(null)} className="text-[#8C7A6B] hover:text-[#4A3F35] px-4 py-2 font-bold">取消</button>
              <button onClick={handleSaveEdit} className="bg-[#4A3F35] hover:bg-[#5A4F45] text-white font-bold px-6 py-2 rounded-lg">儲存</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2">
        {questions.length > 0 && (
          <div className="flex items-center px-4 py-2 bg-[#FDFBF7] rounded-lg border border-[#D5CFC4] mb-2 sticky top-0 z-10">
            <input type="checkbox" checked={selectedQuestions.length === questions.length} onChange={toggleSelectAll} className="w-4 h-4 mr-3" />
            <span className="text-sm text-[#8C7A6B] font-bold">全選本頁</span>
          </div>
        )}
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-[#EAE6DF] rounded-xl p-4 flex items-start group shadow-sm hover:border-[#C2A878] transition-colors">
            <input 
              type="checkbox" 
              checked={selectedQuestions.includes(q.id)} 
              onChange={() => toggleSelectQuestion(q.id)} 
              className="mt-1 w-4 h-4 mr-4" 
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="flex space-x-2 mb-1">
                  <span className="bg-[#EAE2D3] text-[#8C7A6B] px-2 py-0.5 rounded text-xs font-bold">U{q.unit}</span>
                  <span className="bg-[#FDFBF7] border border-[#D5CFC4] text-[#8C7A6B] px-2 py-0.5 rounded text-xs">{q.difficulty === 'easy' ? '簡單' : q.difficulty === 'medium' ? '中等' : '困難'}</span>
                  <span className="bg-[#F5F5F0] text-[#8C7A6B] px-2 py-0.5 rounded text-xs">{q.type === 'fill_in_the_blank' ? '填空題' : '選擇題'}</span>
                  {q.mediaUrl && <span className="bg-[#B39969]/20 text-[#B39969] px-2 py-0.5 rounded text-xs font-bold">多媒體</span>}
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(q)} className="text-sm text-[#8C7A6B] hover:text-[#4A3F35] font-bold">編輯</button>
                  <button onClick={() => handleDelete(q.id)} className="text-sm text-[#B65D48] hover:text-[#8B4534] font-bold">刪除</button>
                </div>
              </div>
              <p className="text-[#4A3F35] font-medium text-lg leading-relaxed">{q.prompt}</p>
              {q.mediaUrl && (
                  <p className="text-xs text-[#8C7A6B] mt-1 break-all">🔗 {q.mediaUrl}</p>
              )}
              {q.options && q.options.length > 0 && (
                <div className="mt-2 text-sm text-[#6A5F55] grid grid-cols-2 gap-1 bg-[#FDFBF7] p-2 rounded border border-[#EAE6DF]">
                  {q.options.map((opt, idx) => (
                    <span key={idx} className={opt === q.correctAnswer ? 'font-bold text-[#8F9A8A]' : ''}>
                      {String.fromCharCode(65 + idx)}. {opt} {opt === q.correctAnswer && '✓'}
                    </span>
                  ))}
                </div>
              )}
              {!q.options && (
                <div className="mt-2 text-sm">
                  <span className="text-[#8C7A6B]">正確答案:</span> <span className="font-bold text-[#8F9A8A]">{q.correctAnswer}</span>
                </div>
              )}
              {q.explanation && (
                <div className="mt-2 text-sm bg-[#F5F5F0] p-2 rounded text-[#6A5F55] italic">
                  💡 詳解: {q.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
        {questions.length === 0 && <p className="text-[#A69B8F] text-center py-10">尚無題目，請點擊右上角新增</p>}
      </div>
    </div>
  );
}
`;
code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
