const fs = require('fs');

let code = fs.readFileSync('current_app.tsx', 'utf8');

// 1. Update SubQuestion, Question, Task Attempt interfaces
code = code.replace(
  /export interface Question \{[\s\S]*?createdAt: number;\n\}/,
  `export interface SubQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_in_the_blank';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Question {
  id: string;
  subject: Subject;
  unit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'fill_in_the_blank' | 'question_group';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  clue?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'youtube' | 'audio';
  explanation?: string;
  subQuestions?: SubQuestion[];
  createdAt: number;
}`
);

code = code.replace(
  /export interface Task \{[\s\S]*?createdAt: number;\n\}/,
  `export interface Task {
  id: string;
  title: string;
  subject: Subject;
  targetUnits: number[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  gameMode?: 'normal' | 'survival' | 'speed';
  questionCount: number;
  mcCount?: number;
  fibCount?: number;
  maxHearts?: number;
  timeLimit?: number;
  antiCheat?: boolean;
  isActive: boolean;
  createdAt: number;
}`
);

// Add cheatCount to Attempt if not there
if (!code.includes('cheatCount?: number;')) {
    code = code.replace(/timeTaken: number;/, `timeTaken: number;\n  cheatCount?: number;`);
}

// 2. TasksTab modifications
// Add state
code = code.replace(/const \[maxHearts, setMaxHearts\] = useState<number>\(3\);/,
  `const [maxHearts, setMaxHearts] = useState<number>(3);
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [antiCheat, setAntiCheat] = useState<boolean>(false);`
);

// In handleCreate
code = code.replace(/maxHearts: maxHearts \|\| 0\n\s*\}\);/, `maxHearts: maxHearts || 0, timeLimit, antiCheat\n        });`);
code = code.replace(/maxHearts: maxHearts \|\| 0, isActive: true/, `maxHearts: maxHearts || 0, timeLimit, antiCheat, isActive: true`);

// In handleEditTask
code = code.replace(/setMaxHearts\(t\.maxHearts \|\| 3\);/, `setMaxHearts(t.maxHearts || 3);\n    setTimeLimit(t.timeLimit || 10);\n    setAntiCheat(t.antiCheat || false);`);

// In TasksTab JSX
code = code.replace(/<div>\s*<label className="block text-sm font-medium mb-1">生命值 \(愛心\)([\s\S]*?)<\/div>/,
  `{gameMode === 'survival' && (
              <div>
                <label className="block text-sm font-medium mb-1">生命值 (愛心)</label>
                <input type="number" value={maxHearts} onChange={e => setMaxHearts(Number(e.target.value))} className="w-full border rounded p-2 focus:ring-2 focus:ring-[#A7C4B5] outline-none" min={1} />
              </div>
            )}
            {gameMode === 'speed' && (
              <div>
                <label className="block text-sm font-medium mb-1">每題作答秒數</label>
                <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="w-full border rounded p-2 focus:ring-2 focus:ring-[#A7C4B5] outline-none" min={1} />
              </div>
            )}
            <div>
               <label className="flex items-center space-x-2 text-sm font-medium">
                 <input type="checkbox" checked={antiCheat} onChange={e => setAntiCheat(e.target.checked)} className="rounded text-[#A7C4B5] focus:ring-[#A7C4B5]" />
                 <span>啟用防作弊 (偵測離開分頁次數)</span>
               </label>
            </div>`
);

// 3. QuestionsTab modifications
// In available types, maybe we don't filter by multimedia/group yet, but display tags
code = code.replace(/<span className="text-xs bg-gray-100 px-2 py-1 rounded">\{q\.type === 'multiple_choice' \? '選擇' : '填空'\}<\/span>/,
  `{q.type === 'multiple_choice' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">選擇</span>}
                    {q.type === 'fill_in_the_blank' && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">填空</span>}
                    {q.type === 'question_group' && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">題組</span>}
                    {q.mediaUrl && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">多媒體</span>}`
);

// Add the skill download function inside QuestionsTab
const skillTxtContent = `const downloadSkillTxt = () => {
    const text = \`# Role
你是一位專業的教育測驗命題專家，專門設計高品質、符合教學邏輯的測驗題目。

# Task
請根據提供的「科目」、「單元大綱」與「期望題數」，生成題庫。請嚴格按照以下 JSON 格式產出。

# Generation Rules (命題規則)
1. 題型 (type)：必須混合產出以下三種題型：
   - 選擇題 (multiple_choice)：提供 4 個選項。
   - 填空題 (fill_in_the_blank)：題目中需使用底線（___）。
   - 題組 (question_group)：包含一段主文本（prompt）與數個子問題（subQuestions）。
2. 多媒體題 (Multimedia)：若適合搭配圖片、影片或音訊，可提供 mediaUrl 與 mediaType。mediaType 可填寫 image, youtube, 或 audio。
3. 每個物件必須包含單元 (unit)、難易度 (difficulty)、詳解 (explanation)。

# JSON Output Format
[
  {
    "prompt": "題目內容（若為填空題請留 ___）",
    "correctAnswer": "正確答案",
    "options": ["選項A", "選項B", "選項C", "選項D"], // 若無則省略
    "unit": 1,
    "difficulty": "easy", // easy, medium, hard
    "type": "multiple_choice", // multiple_choice, fill_in_the_blank, question_group
    "explanation": "解題詳解",
    "mediaUrl": "https://...", // 選填，例如圖片連結或YouTube連結
    "mediaType": "image", // image, youtube, audio (若有 mediaUrl 則必填)
    "subQuestions": [ // 僅在 type 為 question_group 時提供
      {
        "id": "sq1",
        "type": "multiple_choice",
        "prompt": "子問題1",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "子問題1詳解"
      }
    ]
  }
]\`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill.txt';
    a.click();
    URL.revokeObjectURL(url);
  };`;

code = code.replace(/const handleAiGenerate = async \(\) => \{/, `${skillTxtContent}\n  const handleAiGenerate = async () => {`);

// Add button for skill txt
code = code.replace(/<button\s*onClick=\{handleExport\}\s*className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">\s*<Download size=\{18\} \/>\s*<span>匯出題庫<\/span>\s*<\/button>/,
  `<button onClick={handleExport} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"><Download size={18} /><span>匯出題庫</span></button>
  <button onClick={downloadSkillTxt} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"><BookOpen size={18} /><span>下載題庫生成 skill.txt</span></button>`
);

// 4. GameScreen modifications
// Inside function GameScreen({ task, questions, user, onClose })
// add cheatCount state
code = code.replace(/const \[hearts, setHearts\] = useState\(task\.maxHearts \|\| 3\);/,
  `const [hearts, setHearts] = useState(task.gameMode === 'survival' ? (task.maxHearts || 3) : 999);
  const [cheatCount, setCheatCount] = useState(0);
  const [groupAnswers, setGroupAnswers] = useState<Record<string, string>>({});`
);

// add tab change detection
const cheatDetectionEffect = `
  useEffect(() => {
    if (!task.antiCheat || isFinished) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatCount(c => c + 1);
        alert('警告：偵測到您切換分頁或離開測驗視窗！');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [task.antiCheat, isFinished]);
`;
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(\!task || questions\.length === 0\) return;/, `${cheatDetectionEffect}\n  useEffect(() => {\n    if (!task || questions.length === 0) return;`);

// timer logic for speed mode
// We need to set time to task.timeLimit || 10 for speed mode.
code = code.replace(/const \[timeLeft, setTimeLeft\] = useState\(10\);/, `const [timeLeft, setTimeLeft] = useState(task.timeLimit || 10);`);
code = code.replace(/setTimeLeft\(10\);/, `setTimeLeft(task.timeLimit || 10);`);

// Modify handleAnswer
const newHandleAnswer = `const handleAnswer = (answer: string | Record<string, string>) => {
    if (!currentQ || isFinished) return;
    const isGroup = currentQ.type === 'question_group';
    let isCorrect = true;
    let finalAnswerStr = '';
    
    if (isGroup) {
      finalAnswerStr = JSON.stringify(answer);
      for (const sq of currentQ.subQuestions || []) {
        const sqAns = (answer as Record<string, string>)[sq.id] || '';
        const isChinese = /[\\u4E00-\\u9FFF]/.test(sq.correctAnswer);
        let sqCorrect = false;
        if (isChinese && sq.type === 'fill_in_the_blank') {
          const ansPinyin = pinyin(sqAns.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
          const correctPinyin = pinyin(sq.correctAnswer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
          sqCorrect = ansPinyin === correctPinyin;
        } else {
          sqCorrect = sqAns.trim().toLowerCase() === sq.correctAnswer.trim().toLowerCase();
        }
        if (!sqCorrect) { isCorrect = false; break; }
      }
    } else {
      finalAnswerStr = answer as string;
      const ans = answer as string;
      const isChinese = /[\\u4E00-\\u9FFF]/.test(currentQ.correctAnswer);
      if (isChinese && currentQ.type === 'fill_in_the_blank') {
        const ansPinyin = pinyin(ans.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        const correctPinyin = pinyin(currentQ.correctAnswer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        isCorrect = ansPinyin === correctPinyin;
      } else {
        isCorrect = ans.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
      }
    }

    const timeTaken = task.gameMode === 'speed' ? (task.timeLimit || 10) - timeLeft : (Date.now() - questionStartTime) / 1000;
    
    setAttemptAnswers(prev => [...prev, {
      questionId: currentQ.id,
      questionPrompt: currentQ.prompt,
      userAnswer: finalAnswerStr,
      correctAnswer: isGroup ? '全部答對' : currentQ.correctAnswer,
      isCorrect,
      timeTaken
    }]);

    if (isCorrect) {
      setScore(s => s + 10);
    } else {
      setWrongQuestions(prev => [...prev, currentQ.id]);
      if (task.gameMode === 'survival') {
        setHearts(h => {
          const newH = h - 1;
          if (newH <= 0) {
            handleFinish(true);
          }
          return newH;
        });
        if (hearts - 1 <= 0) return; // Prevent next question if dead
      }
    }

    // Reset for next question
    setGroupAnswers({});
    if (currentIndex + 1 < taskQuestions.length) {
      setCurrentIndex(i => i + 1);
      setQuestionStartTime(Date.now());
      if (task.gameMode === 'speed') setTimeLeft(task.timeLimit || 10);
    } else {
      handleFinish();
    }
  };`;

// Find the handleAnswer block and replace it
code = code.replace(/const handleAnswer = \(answer: string\) => \{[\s\S]*?handleFinish\(\);\n    \}\n  \};/, newHandleAnswer);

// Handle finish to include cheatCount
code = code.replace(/timeTaken: Math\.round\(\(Date\.now\(\) - startTime\) \/ 1000\),/, `timeTaken: Math.round((Date.now() - startTime) / 1000),\n        cheatCount,`);

// Question rendering
const questionRenderBlock = `{currentQ.type === 'question_group' ? (
              <div className="space-y-6">
                <p className="text-xl md:text-2xl font-bold mb-4">{currentQ.prompt}</p>
                {currentQ.mediaUrl && (
                  <div className="mb-4">
                    {currentQ.mediaType === 'image' && <img src={currentQ.mediaUrl} alt="media" className="max-w-full h-auto rounded" />}
                    {currentQ.mediaType === 'youtube' && <iframe width="100%" height="315" src={currentQ.mediaUrl.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen className="rounded"></iframe>}
                    {currentQ.mediaType === 'audio' && <audio controls src={currentQ.mediaUrl} className="w-full"></audio>}
                  </div>
                )}
                {currentQ.subQuestions?.map((sq, i) => (
                  <div key={sq.id} className="bg-white/50 p-4 rounded-xl">
                    <p className="text-lg font-bold mb-2">{i + 1}. {sq.prompt}</p>
                    {sq.type === 'multiple_choice' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sq.options?.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setGroupAnswers(prev => ({...prev, [sq.id]: opt}))}
                            className={\`p-4 text-left rounded-xl border-2 transition-all shadow-sm \${groupAnswers[sq.id] === opt ? 'bg-[#A7C4B5] border-[#A7C4B5] text-white' : 'bg-white border-[#EAE3D2] hover:border-[#A7C4B5] hover:shadow-md'}\`}
                          >
                            <span className="font-bold text-lg">{opt}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <form onSubmit={e => e.preventDefault()} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={groupAnswers[sq.id] || ''}
                          onChange={e => setGroupAnswers(prev => ({...prev, [sq.id]: e.target.value}))}
                          className="flex-1 p-4 rounded-xl border-2 border-[#EAE3D2] focus:border-[#A7C4B5] focus:outline-none"
                          placeholder="請輸入答案"
                        />
                      </form>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleAnswer(groupAnswers)}
                  className="w-full mt-4 bg-[#A7C4B5] hover:bg-[#8CAE9D] text-white py-4 rounded-xl font-bold shadow-md transition-colors"
                >
                  送出題組
                </button>
              </div>
            ) : currentQ.type === 'multiple_choice' ? (`;

code = code.replace(/currentQ\.type === 'multiple_choice' \? \(/, questionRenderBlock);

// Heart rendering
code = code.replace(/\{task\.gameMode !== 'speed' && \(\n\s*<div className="flex items-center space-x-1">\n\s*\{Array\.from\(\{ length: hearts \}\)\.map\(\(\_, i\) => \(\n\s*<Heart key=\{i\} className="text-red-500 fill-red-500" size=\{24\} \/>\n\s*\)\)\}\n\s*<\/div>\n\s*\)\}/,
  `{task.gameMode === 'survival' && (
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.max(0, hearts) }).map((_, i) => (
                  <Heart key={i} className="text-red-500 fill-red-500" size={24} />
                ))}
              </div>
            )}`
);

// End screen report cheatCount
code = code.replace(/<p className="text-gray-500">花費時間<\/p>\n\s*<p className="text-2xl font-bold">\{Math\.round\(\(Date\.now\(\) - startTime\) \/ 1000\)\}s<\/p>\n\s*<\/div>\n\s*<\/div>/,
  `<p className="text-gray-500">花費時間</p>
                <p className="text-2xl font-bold">{Math.round((Date.now() - startTime) / 1000)}s</p>
              </div>
              {task.antiCheat && cheatCount > 0 && (
                <div className="bg-white/80 rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-red-500">作弊次數 (切換分頁)</p>
                  <p className="text-2xl font-bold text-red-500">{cheatCount}</p>
                </div>
              )}
            </div>`
);

// Fix Download icon import
if (!code.includes('Download,')) {
    code = code.replace(/import \{ Heart, Settings/, `import { Heart, Settings, Download`);
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
