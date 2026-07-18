const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update ImportTab to have Excel Preview 
const oldImportTab = `export function ImportTab({ subjectId }: { subjectId: Subject }) {
  const [isImporting, setIsImporting] = useState(false);`;
const newImportTab = `export function ImportTab({ subjectId }: { subjectId: Subject }) {
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Question>[]>([]);
`;
code = code.replace(oldImportTab, newImportTab);

// Update FileUpload to preview data
const importBlockStr = `if (extension === 'json') {
          data = JSON.parse(cleanedText);
        }`;
const newImportBlockStr = `if (extension === 'json') {
          data = JSON.parse(cleanedText);
        }
        setPreviewData(data);
        return;`;
code = code.replace(importBlockStr, newImportBlockStr);

// Add the real import handler
const realImportHandler = `const handleConfirmImport = async () => {
    if (previewData.length === 0) return;
    setIsImporting(true);
    try {
      for (const item of previewData) {
        await addDoc(collection(db, 'questions'), {
          ...item,
          subject: subjectId,
          createdAt: Date.now()
        });
      }
      alert(\`成功匯入 \${previewData.length} 題！\`);
      setPreviewData([]);
    } catch(e) {
      console.error(e);
      alert('匯入失敗');
    }
    setIsImporting(false);
  };`;
code = code.replace('const handleFileUpload', realImportHandler + '\n\n  const handleFileUpload');

const oldImportUI = `<p className="text-[#8C7A6B] text-sm">支援 .xlsx, .xls, .json 格式</p>
          </div>
        </label>
      </div>
    </div>`;
const newImportUI = `<p className="text-[#8C7A6B] text-sm">支援 .xlsx, .xls, .json 格式</p>
          </div>
        </label>
      </div>

      {previewData.length > 0 && (
        <div className="mt-8 bg-white border border-[#EAE6DF] rounded-2xl p-6">
          <h3 className="font-serif font-bold text-[#5A4F45] mb-4">預覽匯入資料 ({previewData.length} 題)</h3>
          <div className="max-h-64 overflow-y-auto mb-4 border border-[#EAE6DF] rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F5F0] text-[#8C7A6B]">
                <tr>
                  <th className="p-3">單元</th>
                  <th className="p-3">題型</th>
                  <th className="p-3">難度</th>
                  <th className="p-3">題目</th>
                  <th className="p-3">解答</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 50).map((q, i) => (
                  <tr key={i} className="border-t border-[#EAE6DF]">
                    <td className="p-3">{q.unit}</td>
                    <td className="p-3">{q.type}</td>
                    <td className="p-3">{q.difficulty}</td>
                    <td className="p-3 truncate max-w-[200px]">{q.prompt}</td>
                    <td className="p-3 text-[#72816B]">{q.correctAnswer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 50 && <p className="text-center p-2 text-[#A69B8F] text-xs">... 僅顯示前 50 筆</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setPreviewData([])} className="px-4 py-2 rounded-lg bg-[#EAE6DF] text-[#6A5F55]">取消</button>
            <button onClick={handleConfirmImport} className="px-4 py-2 rounded-lg bg-[#82917B] text-white font-medium shadow-sm">確認匯入</button>
          </div>
        </div>
      )}
    </div>`;
code = code.replace(oldImportUI, newImportUI);

// Fix AI generator
const aiTabBlock = `export function AIGeneratorTab({ subjectId, onRefresh }: { subjectId: Subject, onRefresh: () => void }) {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [type, setType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Partial<Question>[]>([]);

  const handleGenerate = async () => {
    if (!text) return alert('請輸入課文');
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count, type })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerated(data.questions);
    } catch(e: any) {
      alert('產生失敗: ' + e.message);
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    for (const q of generated) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        subject: subjectId,
        unit: 1, // Default to unit 1
        difficulty: 'medium',
        type,
        createdAt: Date.now()
      });
    }
    alert('已儲存至題庫');
    setGenerated([]);
    onRefresh();
  };

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-3xl p-6 space-y-4">
      <h3 className="font-serif font-bold text-[#5A4F45]">AI 輔助出題</h3>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="貼上課文或重點筆記..." className="w-full h-32 bg-[#FDFBF7] border border-[#EAE6DF] rounded-xl p-4 text-[#4A3F35] focus:ring-[#C2A878] focus:border-[#C2A878]" />
      <div className="flex space-x-4">
        <select value={type} onChange={e => setType(e.target.value as any)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]">
          <option value="multiple_choice">選擇題</option>
          <option value="fill_in_the_blank">填空題</option>
        </select>
        <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value)||5)} min="1" max="20" className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35] w-24" />
        <button disabled={generating} onClick={handleGenerate} className="bg-[#C2A878] hover:bg-[#B39969] text-[#4A3F35] px-6 py-2 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
          {generating ? '生成中...' : '開始生成'}
        </button>
      </div>
      
      {generated.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-[#5A4F45]">生成結果 ({generated.length} 題)</h4>
          {generated.map((q, i) => (
            <div key={i} className="p-4 bg-[#F5F5F0] rounded-xl border border-[#D5CFC4]">
              <p className="font-medium text-[#4A3F35] mb-2">{i+1}. {q.prompt}</p>
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, j) => <div key={j} className="text-sm text-[#6A5F55]">{String.fromCharCode(65+j)}. {opt}</div>)}
                </div>
              )}
              <p className="text-sm text-[#72816B] font-medium">解答: {q.correctAnswer}</p>
              {q.clue && <p className="text-xs text-[#8C7A6B] mt-1">詳解: {q.clue}</p>}
            </div>
          ))}
          <button onClick={handleSave} className="bg-[#82917B] hover:bg-[#72816B] text-white px-6 py-2 rounded-lg font-medium shadow-sm w-full">儲存至題庫</button>
        </div>
      )}
    </div>
  );
}`;
code = code.replace('export function ImportTab', aiTabBlock + '\n\nexport function ImportTab');

// Add AI generator tab to TeacherDashboard
const aiTabBtn = `<button onClick={() => setActiveTab('ai')} className={\`px-4 py-2 rounded-lg font-medium transition-all shadow-sm \${activeTab === 'ai' ? 'bg-[#C2A878] text-[#4A3F35]' : 'bg-white text-[#6A5F55] border border-[#EAE6DF] hover:bg-[#F5F5F0]'}\`}>AI出題</button>`;
code = code.replace(`<button onClick={() => setActiveTab('import')}`, aiTabBtn + `\n        <button onClick={() => setActiveTab('import')}`);

const aiTabContent = `{activeTab === 'ai' && <AIGeneratorTab subjectId={subjectId} onRefresh={fetchData} />}`;
code = code.replace(`{activeTab === 'import' && <ImportTab subjectId={subjectId} config={config} />}`, aiTabContent + `\n        {activeTab === 'import' && <ImportTab subjectId={subjectId} config={config} />}`);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated 2');
