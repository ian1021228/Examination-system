const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const matchStr = "// Shuffle and slice";
const idx = code.indexOf(matchStr);

const endStr = "if (allQs.length === 0) {";
const endIdx = code.indexOf(endStr, idx);

const oldBlock = code.substring(idx, endIdx);

const newBlock = `// Shuffle and slice
        if (taskData.mcCount !== undefined || taskData.fibCount !== undefined) {
          let mcQs = allQs.filter(q => q.type === 'multiple_choice').sort(() => Math.random() - 0.5);
          let fibQs = allQs.filter(q => q.type === 'fill_in_the_blank').sort(() => Math.random() - 0.5);
          let targetMc = taskData.mcCount || 0;
          let targetFib = taskData.fibCount || 0;
          allQs = [...mcQs.slice(0, targetMc), ...fibQs.slice(0, targetFib)].sort(() => Math.random() - 0.5);
        } else {
          allQs.sort(() => Math.random() - 0.5);
          if (allQs.length > taskData.questionCount) {
            allQs = allQs.slice(0, taskData.questionCount);
          }
        }
        
        `;

code = code.substring(0, idx) + newBlock + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
console.log('done updating initGame');
