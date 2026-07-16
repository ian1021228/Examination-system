const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `  const filteredAttempts = selectedTask === 'all' ? attempts : attempts.filter(a => a.taskId === selectedTask);
  const searchedAttempts = filteredAttempts.filter(a => 
    a.userDisplayName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp);`;

const rep1 = `  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const filteredAttempts = selectedTask === 'all' ? attempts : attempts.filter(a => a.taskId === selectedTask);
  const userFilteredAttempts = selectedUserFilter === 'all' ? filteredAttempts : filteredAttempts.filter(a => a.userId === selectedUserFilter);
  const searchedAttempts = userFilteredAttempts.filter(a => 
    a.userDisplayName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp);
  
  const uniqueUsers = Array.from(new Set(filteredAttempts.map(a => a.userId))).map(id => {
    return { id, name: filteredAttempts.find(a => a.userId === id)?.userDisplayName || '未知' };
  });`;

const target2 = `  // Group by student
  const studentStats = filteredAttempts.reduce((acc, att) => {`;

const rep2 = `  // Group by student
  const studentStats = userFilteredAttempts.reduce((acc, att) => {`;

const target3 = `  const activePlayers = Object.keys(studentStats).length;
  const avgScore = filteredAttempts.length > 0 ? Math.round(filteredAttempts.reduce((s, a) => s + a.score, 0) / filteredAttempts.length) : 0;
  const highScore = filteredAttempts.length > 0 ? Math.max(...filteredAttempts.map(a => a.score)) : 0;

  // Find all difficult questions
  const wrongCountMap = filteredAttempts.reduce((acc, att) => {`;

const rep3 = `  const activePlayers = Object.keys(studentStats).length;
  const avgScore = userFilteredAttempts.length > 0 ? Math.round(userFilteredAttempts.reduce((s, a) => s + a.score, 0) / userFilteredAttempts.length) : 0;
  const highScore = userFilteredAttempts.length > 0 ? Math.max(...userFilteredAttempts.map(a => a.score)) : 0;

  // Find all difficult questions
  const wrongCountMap = userFilteredAttempts.reduce((acc, att) => {`;

const target4 = `  const chartData = [...filteredAttempts].sort((a, b) => a.timestamp - b.timestamp).map(a => {`;

const rep4 = `  const chartData = [...userFilteredAttempts].sort((a, b) => a.timestamp - b.timestamp).map(a => {`;

const target5 = `<h3 className="text-xl font-bold text-white">測驗數據分析</h3>
        <select 
          value={selectedTask} 
          onChange={e => setSelectedTask(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white min-w-[200px]"
        >
          <option value="all">全部任務</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>`;

const rep5 = `<h3 className="text-xl font-bold text-white">測驗數據分析</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select 
              value={selectedTask} 
              onChange={e => setSelectedTask(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white min-w-[200px]"
            >
              <option value="all">全部任務</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <select 
              value={selectedUserFilter} 
              onChange={e => setSelectedUserFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white min-w-[150px]"
            >
              <option value="all">全部使用者</option>
              {uniqueUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
        </div>`;


code = code.replace(target1, rep1).replace(target2, rep2).replace(target3, rep3).replace(target4, rep4).replace(target5, rep5);
fs.writeFileSync('src/App.tsx', code);
console.log('App updated');
