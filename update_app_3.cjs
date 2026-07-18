const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Task form Game Mode
const gameModeState = `const [diff, setDiff] = useState<'easy'|'medium'|'hard'|'mixed'>('mixed');
  const [gameMode, setGameMode] = useState<'normal'|'survival'|'speed'>('normal');`;
code = code.replace(`const [diff, setDiff] = useState<'easy'|'medium'|'hard'|'mixed'>('mixed');`, gameModeState);

const handleCreateTask = `title, targetUnits: units, difficulty: diff, gameMode, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts || 0`;
code = code.replace(/title, targetUnits: units, difficulty: diff, questionCount: totalCount, mcCount, fibCount, maxHearts: maxHearts \|\| 0/g, handleCreateTask);

const taskFormGameMode = `<div className="flex flex-col space-y-1">
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
            </div>`;
code = code.replace(/<div className="flex flex-col space-y-1">\s*<label className="text-xs text-\[#8C7A6B\]">難度設定<\/label>[\s\S]*?<\/select>\s*<\/div>/, taskFormGameMode);

// Questions Form Multimedia
const qFormMedia = `const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image'|'youtube'|'audio'>('image');`;
code = code.replace(`const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');`, qFormMedia);

const handleAddQ = `type: newType,
      mediaUrl: newMediaUrl || null,
      mediaType: newMediaUrl ? newMediaType : null,
      prompt: newPrompt,`;
code = code.replace(/type: newType,\s*prompt: newPrompt,/g, handleAddQ);

const qFormMediaInputs = `<div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-[#8C7A6B]">多媒體 URL (圖片/YouTube)</label><input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" placeholder="選填 https://..." /></div>
            <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={newMediaType} onChange={e => setNewMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
          </div>
          <div><label className="text-xs text-[#8C7A6B]">題目內容</label>`;
code = code.replace(`<div><label className="text-xs text-[#8C7A6B]">題目內容</label>`, qFormMediaInputs);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated 3');
