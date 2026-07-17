const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldState = `const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);`;

const newState = `const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);`;

code = code.replace(oldState, newState);

const oldRow = `{searchedAttempts.map(a => (
                <tr key={a.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="p-4">
                     <input type="checkbox" checked={selectedAttempts.includes(a.id)} onChange={() => toggleSelectAttempt(a.id)} className="w-4 h-4 rounded border-gray-600" />
                  </td>
                  <td className="p-4 text-gray-300">{new Date(a.timestamp).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4 text-white">{a.userDisplayName}</td>
                  <td className="p-4 text-yellow-400 font-bold">{a.score}</td>
                  <td className="p-4 text-blue-400">{a.correctCount !== undefined ? \`\${a.correctCount} / \${a.totalAnswered}\` : '-'}</td>
                  <td className="p-4 text-green-400">{a.accuracy}%</td>
                  <td className="p-4 text-gray-400">{Math.floor(a.timeTaken / 1000)} 秒</td>
                </tr>
              ))}`;

const newRow = `{searchedAttempts.map(a => (
                <React.Fragment key={a.id}>
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => setExpandedAttemptId(expandedAttemptId === a.id ? null : a.id)}>
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                       <input type="checkbox" checked={selectedAttempts.includes(a.id)} onChange={() => toggleSelectAttempt(a.id)} className="w-4 h-4 rounded border-gray-600" />
                    </td>
                    <td className="p-4 text-gray-300">{new Date(a.timestamp).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 text-white flex items-center">{a.userDisplayName} {a.answers && <span className="ml-2 text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">可展開</span>}</td>
                    <td className="p-4 text-yellow-400 font-bold">{a.score}</td>
                    <td className="p-4 text-blue-400">{a.correctCount !== undefined ? \`\${a.correctCount} / \${a.totalAnswered}\` : '-'}</td>
                    <td className="p-4 text-green-400">{a.accuracy}%</td>
                    <td className="p-4 text-gray-400">{Math.floor(a.timeTaken / 1000)} 秒</td>
                  </tr>
                  {expandedAttemptId === a.id && a.answers && (
                    <tr className="bg-gray-950/40 border-b border-gray-700/50">
                      <td colSpan={7} className="p-4 whitespace-normal">
                        <div className="space-y-3 p-2">
                          <h4 className="text-sm font-bold text-gray-300 flex items-center">
                            <List size={16} className="mr-2" /> 答題詳情明細
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {a.answers.map((ans, idx) => (
                              <div key={idx} className={\`p-4 rounded-xl border \${ans.isCorrect ? 'border-green-500/20 bg-green-900/10' : 'border-red-500/20 bg-red-900/10'}\`}>
                                <p className="text-sm text-white mb-2 leading-relaxed"><span className="text-purple-400 font-bold mr-2">Q{idx + 1}</span> {ans.questionPrompt}</p>
                                <div className="flex justify-between items-end mt-2">
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400">你的答案: <span className={\`font-bold \${ans.isCorrect ? 'text-green-400' : 'text-red-400 line-through'}\`}>{ans.userAnswer || '(未作答)'}</span></p>
                                    {!ans.isCorrect && <p className="text-xs text-gray-400">正確答案: <span className="text-green-400 font-bold">{ans.correctAnswer}</span></p>}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded">
                                    ⏱️ {(ans.timeTaken / 1000).toFixed(1)}s
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}`;

code = code.replace(oldRow, newRow);

fs.writeFileSync('src/App.tsx', code);
console.log('done expanding row');
