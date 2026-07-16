const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldTable = `<div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-center">
          <h3 className="font-bold text-gray-200">實時答題歷史明細</h3>
          <input type="text" placeholder="搜尋姓名..." value={search} onChange={e => setSearch(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-700 bg-gray-900/30">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-800/60 text-xs text-gray-400">
              <tr>
                <th className="p-4">日期</th>
                <th className="p-4">姓名</th>
                <th className="p-4">得分</th>
                <th className="p-4">準確度</th>
                <th className="p-4">花費時間</th>
              </tr>
            </thead>
            <tbody>
              {searchedAttempts.map(a => (
                <tr key={a.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="p-4 text-gray-300">{new Date(a.timestamp).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4 text-white">{a.userDisplayName}</td>
                  <td className="p-4 text-yellow-400 font-bold">{a.score}</td>
                  <td className="p-4 text-green-400">{a.accuracy}%</td>
                  <td className="p-4 text-gray-400">{Math.floor(a.timeTaken / 1000)} 秒</td>
                </tr>
              ))}
              {searchedAttempts.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">沒有找到相符的紀錄</td></tr>
              )}
            </tbody>
          </table>`;

const newTable = `<div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-center">
          <div className="flex items-center space-x-4">
             <h3 className="font-bold text-gray-200">實時答題歷史明細</h3>
             {selectedAttempts.length > 0 && (
                <button disabled={deleting} onClick={() => handleDeleteAttempts(selectedAttempts)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                   刪除已選 ({selectedAttempts.length})
                </button>
             )}
          </div>
          <div className="flex space-x-2">
            <input type="text" placeholder="搜尋姓名..." value={search} onChange={e => setSearch(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
            <button disabled={deleting || searchedAttempts.length === 0} onClick={() => handleDeleteAttempts(searchedAttempts.map(a => a.id))} className="bg-red-900/40 border border-red-500/40 text-red-400 hover:bg-red-800/60 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
               刪除全部結果
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-700 bg-gray-900/30">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-800/60 text-xs text-gray-400">
              <tr>
                <th className="p-4 w-10">
                   <input type="checkbox" checked={searchedAttempts.length > 0 && selectedAttempts.length === searchedAttempts.length} onChange={toggleSelectAllAttempts} className="w-4 h-4 rounded border-gray-600" />
                </th>
                <th className="p-4">日期</th>
                <th className="p-4">姓名</th>
                <th className="p-4">得分</th>
                <th className="p-4">準確度</th>
                <th className="p-4">花費時間</th>
              </tr>
            </thead>
            <tbody>
              {searchedAttempts.map(a => (
                <tr key={a.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="p-4">
                     <input type="checkbox" checked={selectedAttempts.includes(a.id)} onChange={() => toggleSelectAttempt(a.id)} className="w-4 h-4 rounded border-gray-600" />
                  </td>
                  <td className="p-4 text-gray-300">{new Date(a.timestamp).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4 text-white">{a.userDisplayName}</td>
                  <td className="p-4 text-yellow-400 font-bold">{a.score}</td>
                  <td className="p-4 text-green-400">{a.accuracy}%</td>
                  <td className="p-4 text-gray-400">{Math.floor(a.timeTaken / 1000)} 秒</td>
                </tr>
              ))}
              {searchedAttempts.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">沒有找到相符的紀錄</td></tr>
              )}
            </tbody>
          </table>`;

if(code.includes(oldTable)) {
    code = code.replace(oldTable, newTable);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Table updated');
} else {
    console.log('Table not found');
}
