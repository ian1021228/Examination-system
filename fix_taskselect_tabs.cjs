const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const tabState = "const [activeTab, setActiveTab] = useState<'tasks'|'mistakes'>('tasks');";
const newTabState = "const [activeTab, setActiveTab] = useState<'tasks'|'mistakes'|'leaderboard'>('tasks');";

const tabButtons = `<div className="flex space-x-2 bg-white border border-[#EAE6DF] p-1.5 rounded-xl shadow-sm mb-6 w-full max-w-sm">
        <button onClick={() => setActiveTab('tasks')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'tasks' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          我的任務
        </button>
        <button onClick={() => setActiveTab('mistakes')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'mistakes' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          我的錯題本
        </button>
      </div>`;

const newTabButtons = `<div className="flex space-x-2 bg-white border border-[#EAE6DF] p-1.5 rounded-xl shadow-sm mb-6 w-full max-w-md">
        <button onClick={() => setActiveTab('tasks')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'tasks' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          我的任務
        </button>
        <button onClick={() => setActiveTab('mistakes')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'mistakes' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          錯題本
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={\`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'leaderboard' ? 'bg-[#C2A878] text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F5F5F0]'}\`}>
          排行榜
        </button>
      </div>`;

const tabContent = `      {activeTab === 'tasks' ? (
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
      )}`;

const newTabContent = `      {activeTab === 'tasks' && (
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
      )}
      {activeTab === 'mistakes' && <MistakesTab user={user} />}
      {activeTab === 'leaderboard' && <LeaderboardTab user={user} />}`;

code = code.replace(tabState, newTabState);
code = code.replace(tabButtons, newTabButtons);
code = code.replace(tabContent, newTabContent);

fs.writeFileSync('src/App.tsx', code);
