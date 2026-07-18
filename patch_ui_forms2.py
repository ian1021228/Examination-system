import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target_add = """            <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-[#8C7A6B]">多媒體 URL (選填)</label><input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" placeholder="圖片或YouTube網址" /></div>
            <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={newMediaType} onChange={e => setNewMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
          </div>
          <div><label className="text-xs text-[#8C7A6B]">題目內容</label><input value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入題目..." /></div>
          <div><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={newAnswer} onChange={e => setNewAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入正確答案..." /></div>
          {newType === 'multiple_choice' && (
            <div><label className="text-xs text-[#8C7A6B]">選項 (逗號分隔)</label><input value={newOptions} onChange={e => setNewOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="A, B, C, D" /></div>
          )}
          <div><label className="text-xs text-[#8C7A6B]">詳解 (選填)</label><textarea value={newExplanation} onChange={e => setNewExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入詳解..." rows={2} /></div>"""

replacement_add = """            <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option><option value="question_group">閱讀題組</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-[#8C7A6B]">多媒體 URL (選填)</label><input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" placeholder="圖片或YouTube網址" /></div>
            <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={newMediaType} onChange={e => setNewMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
          </div>
          <div><label className="text-xs text-[#8C7A6B]">{newType === 'question_group' ? '閱讀文章內容' : '題目內容'}</label>{newType === 'question_group' ? <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入文章..." rows={4} /> : <input value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入題目..." />}</div>
          {newType !== 'question_group' && (
            <>
              <div><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={newAnswer} onChange={e => setNewAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入正確答案..." /></div>
              {newType === 'multiple_choice' && (
                <div><label className="text-xs text-[#8C7A6B]">選項 (逗號分隔)</label><input value={newOptions} onChange={e => setNewOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="A, B, C, D" /></div>
              )}
            </>
          )}
          {newType === 'question_group' && <SubQuestionEditor subQuestions={newSubQuestions} setSubQuestions={setNewSubQuestions} />}
          <div className="mt-3"><label className="text-xs text-[#8C7A6B]">詳解 (選填)</label><textarea value={newExplanation} onChange={e => setNewExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35] mb-3" placeholder="輸入詳解..." rows={2} /></div>"""

if target_add in content:
    content = content.replace(target_add, replacement_add)
    print("PATCH ADD")
else:
    print("ADD NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
