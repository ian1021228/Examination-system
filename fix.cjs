const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `        {currentQ.clue && (
          <p className="text-sm text-gray-400 bg-gray-950/40 py-2 px-4 rounded-xl border border-gray-800/40 inline-block mb-6">
            提示: {currentQ.clue}
          </p>
        )}`;
const replacement = `        {currentQ.clue && task.subject !== 'ket' && (
          <p className="text-sm text-gray-400 bg-gray-950/40 py-2 px-4 rounded-xl border border-gray-800/40 inline-block mb-6">
            提示: {currentQ.clue}
          </p>
        )}

        {showingWrongAnswer && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 relative overflow-hidden text-center">
             <p className="text-red-200 font-bold mb-2">正確答案：<span className="text-white text-xl ml-2">{currentQ.correctAnswer}</span></p>
             <div className="w-full bg-red-900/50 h-1 absolute bottom-0 left-0">
               <div className="bg-red-500 h-1" style={{ animation: 'shrinkWidth 2s linear forwards' }}></div>
             </div>
          </div>
        )}`;
if(code.includes(target)) {
    fs.writeFileSync('src/App.tsx', code.replace(target, replacement));
    console.log('Success');
} else {
    console.log('Not found');
}
