import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """              {q.options && q.options.length > 0 && (
                <div className="mt-2 text-sm text-[#6A5F55] grid grid-cols-2 gap-1 bg-[#FDFBF7] p-2 rounded border border-[#EAE6DF]">
                  {q.options.map((opt, idx) => (
                    <span key={idx} className={opt === q.correctAnswer ? 'font-bold text-[#8F9A8A]' : ''}>
                      {String.fromCharCode(65 + idx)}. {opt} {opt === q.correctAnswer && '✓'}
                    </span>
                  ))}
                </div>
              )}
              {!q.options && (
                <div className="mt-2 text-sm">
                  <span className="text-[#8C7A6B]">正確答案:</span> <span className="font-bold text-[#8F9A8A]">{q.correctAnswer}</span>
                </div>
              )}
              {q.explanation && (
                <div className="mt-2 text-sm bg-[#F5F5F0] p-2 rounded text-[#6A5F55] italic">
                  💡 詳解: {q.explanation}
                </div>
              )}"""

replacement = """              {q.type === 'question_group' && q.subQuestions && q.subQuestions.length > 0 ? (
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-[#D5CFC4]">
                  {q.subQuestions.map((sq, idx) => (
                    <div key={sq.id} className="text-sm">
                      <p className="font-bold text-[#4A3F35] mb-1">{idx + 1}. {sq.prompt}</p>
                      {sq.options && sq.options.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1 text-[#6A5F55]">
                          {sq.options.map((opt, oIdx) => (
                            <span key={oIdx} className={opt === sq.correctAnswer ? 'font-bold text-[#8F9A8A]' : ''}>
                              {String.fromCharCode(65 + oIdx)}. {opt} {opt === sq.correctAnswer && '✓'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div><span className="text-[#8C7A6B]">正確答案:</span> <span className="font-bold text-[#8F9A8A]">{sq.correctAnswer}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 text-sm text-[#6A5F55] grid grid-cols-2 gap-1 bg-[#FDFBF7] p-2 rounded border border-[#EAE6DF]">
                      {q.options.map((opt, idx) => (
                        <span key={idx} className={opt === q.correctAnswer ? 'font-bold text-[#8F9A8A]' : ''}>
                          {String.fromCharCode(65 + idx)}. {opt} {opt === q.correctAnswer && '✓'}
                        </span>
                      ))}
                    </div>
                  )}
                  {!q.options && (
                    <div className="mt-2 text-sm">
                      <span className="text-[#8C7A6B]">正確答案:</span> <span className="font-bold text-[#8F9A8A]">{q.correctAnswer}</span>
                    </div>
                  )}
                </>
              )}
              {q.explanation && (
                <div className="mt-2 text-sm bg-[#F5F5F0] p-2 rounded text-[#6A5F55] italic">
                  💡 詳解: {q.explanation}
                </div>
              )}"""

if target in content:
    content = content.replace(target, replacement)
    print("PATCH RENDER")
else:
    print("RENDER NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
