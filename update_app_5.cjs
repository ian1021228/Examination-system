const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Mistake Book for Student
const mistakeTabBlock = `export function MistakesTab({ user }: { user: UserProfile }) {
  const [mistakes, setMistakes] = useState<(Question & { errorCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'attempts'), where('userId', '==', user.uid)));
        const errorCounts: Record<string, number> = {};
        snap.docs.forEach(d => {
          const attempt = d.data() as Attempt;
          (attempt.wrongQuestionIds || []).forEach(qid => {
            errorCounts[qid] = (errorCounts[qid] || 0) + 1;
          });
        });
        
        const qids = Object.keys(errorCounts);
        if (qids.length === 0) {
          setMistakes([]);
          setLoading(false);
          return;
        }

        const qSnap = await getDocs(collection(db, 'questions')); // Assuming we can fetch all or chunk it
        const qs: (Question & { errorCount: number })[] = [];
        qSnap.docs.forEach(d => {
          if (errorCounts[d.id]) {
            qs.push({ id: d.id, ...d.data(), errorCount: errorCounts[d.id] } as any);
          }
        });
        setMistakes(qs.sort((a,b) => b.errorCount - a.errorCount));
      } catch(e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchMistakes();
  }, [user.uid]);

  if (loading) return <div className="text-center py-10 text-[#A69B8F]">載入中...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-serif font-bold text-[#4A3F35]">我的錯題本</h3>
      {mistakes.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center border border-[#EAE6DF]">
          <CheckCircle className="w-12 h-12 text-[#72816B] mx-auto mb-4" />
          <p className="text-[#8C7A6B]">太棒了！目前沒有錯題紀錄。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mistakes.map(m => (
            <div key={m.id} className="bg-white border border-[#EAE6DF] p-5 rounded-2xl relative shadow-sm">
              <span className="absolute top-4 right-4 text-xs font-bold bg-[#BC7665]/10 text-[#AC6655] px-2 py-1 rounded">錯過 {m.errorCount} 次</span>
              <p className="text-[#4A3F35] font-medium pr-16 mb-4">{m.prompt}</p>
              <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#EAE6DF]">
                <p className="text-xs text-[#8C7A6B] mb-1">正確答案</p>
                <p className="text-[#72816B] font-bold">{m.correctAnswer}</p>
              </div>
              {m.clue && (
                <div className="mt-3 p-3 bg-[#EAE2D3] rounded-xl">
                  <p className="text-xs text-[#B39969] font-bold mb-1">老師解析</p>
                  <p className="text-[#5A4F45] text-sm">{m.clue}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;
code = code.replace('export function TaskSelect', mistakeTabBlock + '\n\nexport function TaskSelect');

// Add Mistakes Book tab to Student dashboard
const studentTabs = `<div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex space-x-2 bg-white border border-[#EAE6DF] p-1.5 rounded-xl shadow-sm w-full md:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('tasks')} className={\`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'tasks' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:text-[#5A4F45]'}\`}>
            我的任務
          </button>
          <button onClick={() => setActiveTab('mistakes')} className={\`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'mistakes' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:text-[#5A4F45]'}\`}>
            我的錯題本
          </button>
        </div>`;
code = code.replace(/<div className="flex space-x-4 mb-6">\s*<h2 className="text-2xl font-serif font-black text-\[#4A3F35\] flex items-center">.*?<\/h2>\s*<\/div>/, studentTabs); // Actually, we might just inject it cleanly.

const studentMain = `export function TaskSelect({ user }: { user: UserProfile }) {
  const { subjectId } = useParams<{ subjectId: Subject }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks'|'mistakes'>('tasks');`;
code = code.replace(/export function TaskSelect\(\{ user \}: \{ user: UserProfile \}\) \{\s*const \{ subjectId \} = useParams<\{ subjectId: Subject \}>\(\);\s*const \[tasks, setTasks\] = useState<Task\[\]>\(\[\]\);\s*const \[attempts, setAttempts\] = useState<Attempt\[\]>\(\[\]\);/, studentMain);

const studentTabContent = `{activeTab === 'tasks' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`;
code = code.replace(`<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`, studentTabContent);

const studentTabContentEnd = `</div>
      ) : (
        <MistakesTab user={user} />
      )}`;
code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}/g, `</div>\n      ${studentTabContentEnd}\n    </div>\n  );\n}`); // Careful with this replace, might be ambiguous. Let's do it safer.

const exactEndMatch = `</div>
    </div>
  );
}

export function GameScreen() {`;

const newExactEndMatch = `</div>
      ) : (
        <MistakesTab user={user} />
      )}
    </div>
  );
}

export function GameScreen() {`;
code = code.replace(exactEndMatch, newExactEndMatch);

const taskListH2 = `<h2 className="text-2xl font-serif font-black text-[#4A3F35] flex items-center">
          <Gamepad className="mr-3 w-8 h-8 text-[#C2A878]" />
          選擇關卡
        </h2>`;
code = code.replace(taskListH2, ''); // remove the old H2

const newStudentTabs = `<h2 className="text-2xl font-serif font-black text-[#4A3F35] flex items-center mb-6">
        <Gamepad className="mr-3 w-8 h-8 text-[#C2A878]" />
        學習儀表板
      </h2>
      <div className="flex space-x-2 bg-white border border-[#EAE6DF] p-1.5 rounded-xl shadow-sm mb-6 max-w-sm">
          <button onClick={() => setActiveTab('tasks')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'tasks' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
            我的任務
          </button>
          <button onClick={() => setActiveTab('mistakes')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'mistakes' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
            我的錯題本
          </button>
      </div>`;
code = code.replace(`<div className="flex space-x-4 mb-6">`, newStudentTabs + `\n<div className="hidden">`); // hide the old flex container to keep code valid

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated 5');
