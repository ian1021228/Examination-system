const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf('export function TaskSelect({ user }: { user: UserProfile }) {');
const endIdx = code.indexOf('export function Gameplay({ user }: { user: UserProfile }) {');

if (startIdx !== -1 && endIdx !== -1) {
  const newTaskSelect = `export function TaskSelect({ user }: { user: UserProfile }) {
  const { subjectId } = useParams<{ subjectId: Subject }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks'|'mistakes'>('tasks');

  useEffect(() => {
    if (!subjectId) return;
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('subject', '==', subjectId),
          where('isActive', '==', true)
        );
        const snap = await getDocs(q);
        const tasksData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
        tasksData.sort((a, b) => b.createdAt - a.createdAt);
        setTasks(tasksData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [subjectId]);

  return (
    <div className="max-w-4xl w-full mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-black text-[#4A3F35] flex items-center">
            <Gamepad className="mr-3 w-8 h-8 text-[#C2A878]" />
            學習儀表板
          </h2>
          <p className="text-[#8C7A6B] mt-2">選擇要挑戰的任務，或複習錯題本</p>
        </div>
        <button onClick={() => navigate('/select-subject')} className="text-[#A69B8F] hover:text-[#5A4F45]">
          返回科目
        </button>
      </div>

      <div className="flex space-x-2 bg-white border border-[#EAE6DF] p-1.5 rounded-xl shadow-sm mb-6 w-full max-w-sm">
        <button onClick={() => setActiveTab('tasks')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'tasks' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          我的任務
        </button>
        <button onClick={() => setActiveTab('mistakes')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'mistakes' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          我的錯題本
        </button>
      </div>

      {activeTab === 'tasks' ? (
        loading ? (
          <div className="text-center py-20 text-[#A69B8F]">載入中...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map(t => (
              <div 
                key={t.id} 
                onClick={() => navigate(\`/play/\${t.id}\`)}
                className="bg-white border border-[#EAE6DF] rounded-3xl p-6 cursor-pointer hover:border-[#C2A878] hover:-translate-y-1 transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-xl font-bold text-[#4A3F35] group-hover:text-[#B39969] transition-colors">{t.title}</h3>
                  <div className="bg-[#EAE2D3] text-[#B39969] p-2 rounded-xl">
                    <Play size={20} className="fill-current" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold bg-[#F5F5F0] text-[#8C7A6B] px-2 py-1 rounded">
                    {t.difficulty === 'easy' ? '簡單' : t.difficulty === 'medium' ? '中等' : t.difficulty === 'hard' ? '困難' : '混合難度'}
                  </span>
                  <span className="text-xs font-bold bg-[#F5F5F0] text-[#8C7A6B] px-2 py-1 rounded">
                    {t.gameMode === 'survival' ? '生存模式' : t.gameMode === 'speed' ? '速答模式' : '一般模式'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#A69B8F]">題數: {t.questionCount} {t.mcCount !== undefined ? \`(選擇 \${t.mcCount}, 填空 \${t.fibCount})\` : ""}</span>
                  <div className="flex items-center text-[#BC7665]">
                    {t.maxHearts ? (
                      <>
                        <Heart className="w-4 h-4 fill-current mr-1" />
                        {t.maxHearts}
                      </>
                    ) : (
                      <span className="text-[#8C7A6B]">無限愛心</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="col-span-full text-center py-20 text-[#A69B8F] bg-white border border-[#EAE6DF] rounded-3xl">
                目前沒有可用的任務
              </div>
            )}
          </div>
        )
      ) : (
        <MistakesTab user={user} />
      )}
    </div>
  );
}

`;
  code = code.substring(0, startIdx) + newTaskSelect + code.substring(endIdx);
  fs.writeFileSync('src/App.tsx', code);
}
