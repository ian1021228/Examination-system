const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `{activeTab === 'attempts' && <AttemptsTab attempts={attempts} questions={questions} tasks={tasks} />}`,
  `{activeTab === 'attempts' && <AttemptsTab attempts={attempts} questions={questions} tasks={tasks} onRefresh={fetchData} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Dashboard updated');
