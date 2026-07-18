const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Game Screen Anti-Cheat
const cheatEffect = `const [cheatCount, setCheatCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatCount(c => c + 1);
        console.warn('Tab switch detected!');
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);`;
code = code.replace(/const \[currentIndex, setCurrentIndex\] = useState\(0\);/, `const [currentIndex, setCurrentIndex] = useState(0);\n  ${cheatEffect}`);

// Game Screen Time Attack
const speedEffect = `const [timeLeft, setTimeLeft] = useState(10);
  
  useEffect(() => {
    if (task?.gameMode === 'speed' && !showingWrongAnswer && lives > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleAnswer(''); // Auto-submit empty if time runs out
            return 10;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [task, currentIndex, showingWrongAnswer, lives]);`;
code = code.replace(/const \[timeLeft, setTimeLeft\] = useState\(0\);/, speedEffect); // actually timeLeft wasn't there
code = code.replace(`const [showingWrongAnswer, setShowingWrongAnswer] = useState(false);`, `const [showingWrongAnswer, setShowingWrongAnswer] = useState(false);\n  ${speedEffect}`);

// Inject Time Left UI
const timeUI = `{task.gameMode === 'speed' && <div className="text-[#BC7665] font-bold mt-2">剩餘時間: {timeLeft}s</div>}`;
code = code.replace(`{Array.from({length: lives}).map((_, i) => <Heart key={i} className="text-[#BC7665] w-5 h-5 fill-current" />)}`, `{Array.from({length: lives}).map((_, i) => <Heart key={i} className="text-[#BC7665] w-5 h-5 fill-current" />)} ${timeUI}`);

// Include cheat count in attempt save
const cheatSave = `totalAnswered: totalQuestions,
          timeTaken,
          cheatCount,
          wrongQuestionIds: currentWrongIds,`;
code = code.replace(/totalAnswered: totalQuestions,\s*timeTaken,\s*wrongQuestionIds: currentWrongIds,/g, cheatSave);

// Game Screen Multimedia renderer
const mediaRender = `const renderMedia = (q: Question) => {
    if (!q.mediaUrl) return null;
    if (q.mediaType === 'youtube') {
      const videoId = q.mediaUrl.split('v=')[1]?.split('&')[0] || q.mediaUrl.split('/').pop();
      return <div className="mb-4 aspect-video"><iframe className="w-full h-full rounded-lg" src={\`https://www.youtube.com/embed/\${videoId}\`} frameBorder="0" allowFullScreen></iframe></div>;
    }
    if (q.mediaType === 'audio') {
      return <audio controls src={q.mediaUrl} className="w-full mb-4" />;
    }
    return <img src={q.mediaUrl} alt="media" className="w-full max-h-64 object-contain rounded-lg mb-4 bg-white/50" />;
  };`;
code = code.replace(`const currentQ = questions[currentIndex];`, mediaRender + `\n\n  const currentQ = questions[currentIndex];`);

const mediaInject = `{renderMedia(currentQ)}
            <p className="text-xl md:text-2xl font-serif font-bold text-[#4A3F35] leading-relaxed break-words">{currentQ.prompt}</p>`;
code = code.replace(`<p className="text-xl md:text-2xl font-serif font-bold text-[#4A3F35] leading-relaxed break-words">{currentQ.prompt}</p>`, mediaInject);

// GameOver cheat count UI
const gameOverCheatUI = `{attempt.cheatCount ? <div className="bg-[#BC7665]/10 border border-[#BC7665]/30 rounded-2xl p-4 mt-4">
            <p className="text-xs text-[#AC6655] font-mono">離開畫面次數 (作弊警告)</p>
            <p className="text-3xl font-black text-[#BC7665] mt-1">{attempt.cheatCount}</p>
          </div> : null}`;
code = code.replace(/<div className="bg-\[#F5F5F0\] border border-\[#EAE6DF\] rounded-2xl p-4">\s*<p className="text-xs text-\[#8C7A6B\] font-mono">時間<\/p>\s*<p className="text-3xl font-black text-\[#8C7A6B\] mt-1">{Math.floor\(attempt.timeTaken \/ 1000\)}s<\/p>\s*<\/div>/g, `$& ${gameOverCheatUI}`);

// Teacher Dashboard Cheat view
const teacherCheatCol = `<th className="p-4">準確度</th>
                <th className="p-4">切窗</th>
                <th className="p-4">花費時間</th>`;
code = code.replace(/<th className="p-4">準確度<\/th>\s*<th className="p-4">花費時間<\/th>/g, teacherCheatCol);

const teacherCheatVal = `<td className="p-4 text-[#72816B]">{a.accuracy}%</td>
                    <td className="p-4 text-[#BC7665] font-bold">{a.cheatCount || 0}</td>
                    <td className="p-4 text-[#8C7A6B]">{Math.floor(a.timeTaken / 1000)} 秒</td>`;
code = code.replace(/<td className="p-4 text-\[#72816B\]">{a.accuracy}%<\/td>\s*<td className="p-4 text-\[#8C7A6B\]">{Math.floor\(a.timeTaken \/ 1000\)} 秒<\/td>/g, teacherCheatVal);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated 4');
