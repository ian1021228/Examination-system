const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldTasksTabForm = `{showForm && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          <input type="text" placeholder="任務標題 (e.g. 第一次段考模擬)" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <select value={diff} onChange={e => setDiff(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                <option value="mixed">混合難度</option><option value="easy">簡單</option><option value="medium">中等</option><option value="hard">困難</option>
              </select>
              <span className="text-xs text-purple-400">符合條件的題庫數量: {availableCount} 題</span>
            </div>
            <div className="flex space-x-2">
                <input type="number" placeholder="題數" value={count || ''} onChange={e => setCount(parseInt(e.target.value) || 0)} className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" />
                <input type="number" placeholder="最多錯幾題(0=不限)" value={maxHearts === 0 ? '' : maxHearts} onChange={e => setMaxHearts(parseInt(e.target.value) || 0)} className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" title="最多錯幾題 (愛心數量，0代表無限)" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">選擇範圍 (單元): {units.length === 0 ? '全部' : units.join(', ')}</p>
            <div className="flex flex-wrap gap-2">`;

const newTasksTabForm = `{showForm && (
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-gray-400">任務標題</label>
            <input type="text" placeholder="任務標題 (e.g. 第一次段考模擬)" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400">難度設定</label>
              <select value={diff} onChange={e => setDiff(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
                <option value="mixed">混合難度</option><option value="easy">簡單</option><option value="medium">中等</option><option value="hard">困難</option>
              </select>
              <span className="text-xs text-purple-400">符合條件的題庫數量: {availableCount} 題</span>
            </div>
            <div className="flex space-x-2">
                <div className="w-1/2 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">發布題數</label>
                  <input type="number" placeholder="題數" value={count || ''} onChange={e => setCount(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" />
                </div>
                <div className="w-1/2 flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">容錯數量 (0為不限)</label>
                  <input type="number" placeholder="最多錯幾題(0=不限)" value={maxHearts === 0 ? '' : maxHearts} onChange={e => setMaxHearts(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-[42px]" title="最多錯幾題 (愛心數量，0代表無限)" />
                </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">選擇範圍 (單元): {units.length === 0 ? '全部' : units.join(', ')}</label>
            <div className="flex flex-wrap gap-2">`;

const oldClue = `{currentQ.clue && task.subject !== 'ket' && (
          <p className="text-sm text-gray-400 bg-gray-950/40 py-2 px-4 rounded-xl border border-gray-800/40 inline-block mb-6">
            提示: {currentQ.clue}
          </p>
        )}`;

const newClue = `{currentQ.clue && (
          <p className="text-sm text-gray-400 bg-gray-950/40 py-2 px-4 rounded-xl border border-gray-800/40 inline-block mb-6">
            提示: {task.subject === 'ket' ? currentQ.clue.split(' / ')[0] : currentQ.clue}
          </p>
        )}`;

code = code.replace(oldTasksTabForm, newTasksTabForm);
code = code.replace(oldClue, newClue);

fs.writeFileSync('src/App.tsx', code);
console.log('UI updated');
