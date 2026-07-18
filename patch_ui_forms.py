import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add SubQuestion Editor helper component
helper_component = """function SubQuestionEditor({ subQuestions, setSubQuestions }: { subQuestions: SubQuestion[], setSubQuestions: (sq: SubQuestion[]) => void }) {
  const handleAddSq = () => {
    setSubQuestions([...subQuestions, { id: Date.now().toString(), type: 'multiple_choice', prompt: '', correctAnswer: '', options: [] }]);
  };
  
  const handleUpdateSq = (idx: number, updates: Partial<SubQuestion>) => {
    const newSqs = [...subQuestions];
    newSqs[idx] = { ...newSqs[idx], ...updates };
    setSubQuestions(newSqs);
  };
  
  const handleRemoveSq = (idx: number) => {
    const newSqs = [...subQuestions];
    newSqs.splice(idx, 1);
    setSubQuestions(newSqs);
  };

  return (
    <div className="mt-4 p-4 border border-[#EAE6DF] rounded-xl bg-[#FDFBF7]">
      <h5 className="font-bold text-[#4A3F35] mb-3">子問題設定</h5>
      {subQuestions.map((sq, idx) => (
        <div key={sq.id} className="mb-4 pb-4 border-b border-[#D5CFC4] last:border-b-0 last:mb-0 last:pb-0 relative">
          <button onClick={() => handleRemoveSq(idx)} className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs font-bold bg-white px-2 py-1 rounded">刪除</button>
          <div className="grid grid-cols-2 gap-3 mb-2 pr-12">
            <div>
              <label className="text-xs text-[#8C7A6B]">子問題題型</label>
              <select value={sq.type} onChange={e => handleUpdateSq(idx, { type: e.target.value as any })} className="w-full bg-white border border-[#D5CFC4] rounded px-3 py-1 text-sm text-[#4A3F35]">
                <option value="multiple_choice">選擇題</option>
                <option value="fill_in_the_blank">填空題</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8C7A6B]">正確答案</label>
              <input value={sq.correctAnswer} onChange={e => handleUpdateSq(idx, { correctAnswer: e.target.value })} className="w-full bg-white border border-[#D5CFC4] rounded px-3 py-1 text-sm text-[#4A3F35]" placeholder="正確答案" />
            </div>
          </div>
          <div className="mb-2">
            <label className="text-xs text-[#8C7A6B]">題目內容</label>
            <input value={sq.prompt} onChange={e => handleUpdateSq(idx, { prompt: e.target.value })} className="w-full bg-white border border-[#D5CFC4] rounded px-3 py-1 text-sm text-[#4A3F35]" placeholder="輸入子問題..." />
          </div>
          {sq.type === 'multiple_choice' && (
            <div>
              <label className="text-xs text-[#8C7A6B]">選項 (逗號分隔)</label>
              <input value={sq.options?.join(', ') || ''} onChange={e => {
                const opts = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                handleUpdateSq(idx, { options: opts });
              }} className="w-full bg-white border border-[#D5CFC4] rounded px-3 py-1 text-sm text-[#4A3F35]" placeholder="A, B, C, D" />
            </div>
          )}
        </div>
      ))}
      <button onClick={handleAddSq} className="mt-2 text-sm text-blue-600 font-bold px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded">+ 新增子問題</button>
    </div>
  );
}

"""

if "function SubQuestionEditor" not in content:
    content = content.replace("export function QuestionsTab", helper_component + "export function QuestionsTab")

with open("src/App.tsx", "w") as f:
    f.write(content)
