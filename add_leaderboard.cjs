const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const leaderboardComponent = `
export function LeaderboardTab({ user }: { user: UserProfile }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const usersData = snap.docs.map(d => d.data() as UserProfile).filter(u => u.role === 'player');
        usersData.sort((a, b) => (b.points || 0) - (a.points || 0));
        setUsers(usersData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const BADGE_INFO: Record<string, { label: string, icon: string, desc: string }> = {
    'perfect_100': { label: '100% 達人', icon: '🎯', desc: '在測驗中獲得 100% 準確率' },
    'speed_demon': { label: '極速傳說', icon: '⚡', desc: '完成計時速答挑戰' },
    'survival_expert': { label: '生存專家', icon: '🛡️', desc: '在生存模式中存活超過 15 題' },
    'honest_player': { label: '誠信守護者', icon: '🕊️', desc: '在測驗中零切換分頁作弊' }
  };

  if (loading) return <div className="text-center py-20 text-[#A69B8F]">載入排行榜中...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EAE6DF] rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end space-x-4 mb-8 pt-4">
          {[1, 0, 2].map((posIndex) => {
            const u = users[posIndex];
            if (!u) return <div key={posIndex} className="w-24"></div>;
            const isFirst = posIndex === 0;
            const isSecond = posIndex === 1;
            return (
              <div key={u.uid} className={\`flex flex-col items-center \${isFirst ? 'transform -translate-y-4' : ''}\`}>
                <div className="relative mb-2">
                  {isFirst && <div className="absolute -top-6 -left-2 text-3xl">👑</div>}
                  {isSecond && <div className="absolute -top-5 -left-2 text-2xl">🥈</div>}
                  {!isFirst && !isSecond && <div className="absolute -top-5 -left-2 text-2xl">🥉</div>}
                  <img src={u.photoURL} alt={u.displayName} className={\`rounded-full border-4 \${isFirst ? 'w-20 h-20 border-[#C2A878] shadow-lg shadow-[#C2A878]/30' : 'w-16 h-16 border-[#D5CFC4]'}\`} />
                </div>
                <div className="font-bold text-[#4A3F35] text-sm text-center line-clamp-1">{u.displayName}</div>
                <div className="text-[#B39969] font-black text-lg">{u.points || 0} pts</div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="space-y-3">
          {users.map((u, i) => (
            <div key={u.uid} className={\`flex items-center justify-between p-4 rounded-xl border \${u.uid === user.uid ? 'bg-[#FDFBF7] border-[#C2A878]' : 'bg-white border-[#EAE6DF] hover:bg-[#FDFBF7]'}\`}>
              <div className="flex items-center space-x-4">
                <span className="font-black text-lg w-6 text-center text-[#A69B8F]">{i + 1}</span>
                <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-bold text-[#4A3F35] flex items-center">
                    {u.displayName}
                    {u.uid === user.uid && <span className="ml-2 text-xs bg-[#C2A878] text-[#4A3F35] px-2 py-0.5 rounded-full">你</span>}
                  </div>
                  <div className="flex space-x-1 mt-1">
                    {(u.badges || []).map(b => BADGE_INFO[b] && (
                      <span key={b} title={BADGE_INFO[b].desc} className="text-sm cursor-help">{BADGE_INFO[b].icon}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="font-black text-[#4A3F35] text-xl">
                {u.points || 0} <span className="text-xs text-[#8C7A6B] font-medium">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

// Insert after MistakesTab
const target = "export function MistakesTab";
code = code.replace(target, leaderboardComponent + "\n" + target);

fs.writeFileSync('src/App.tsx', code);
