import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target_edit = """              <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={editType} onChange={e => setEditType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-[#8C7A6B]">多媒體 URL</label><input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
              <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={editMediaType} onChange={e => setEditMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
            </div>
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">題目內容</label><input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            {editType === 'multiple_choice' && (
              <div className="mb-3"><label className="text-xs text-[#8C7A6B]">選項</label><input value={editOptions} onChange={e => setEditOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
            )}
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">詳解</label><textarea value={editExplanation} onChange={e => setEditExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" rows={2} /></div>"""

replacement_edit = """              <div><label className="text-xs text-[#8C7A6B]">題型</label><select value={editType} onChange={e => setEditType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="multiple_choice">選擇題</option><option value="fill_in_the_blank">填空題</option><option value="question_group">閱讀題組</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-[#8C7A6B]">多媒體 URL</label><input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
              <div><label className="text-xs text-[#8C7A6B]">多媒體類型</label><select value={editMediaType} onChange={e => setEditMediaType(e.target.value as any)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]"><option value="image">圖片</option><option value="youtube">YouTube</option><option value="audio">音訊</option></select></div>
            </div>
            <div className="mb-3"><label className="text-xs text-[#8C7A6B]">{editType === 'question_group' ? '閱讀文章內容' : '題目內容'}</label>{editType === 'question_group' ? <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" rows={4} /> : <input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" />}</div>
            {editType !== 'question_group' && (
              <>
                <div className="mb-3"><label className="text-xs text-[#8C7A6B]">正確答案</label><input value={editAnswer} onChange={e => setEditAnswer(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
                {editType === 'multiple_choice' && (
                  <div className="mb-3"><label className="text-xs text-[#8C7A6B]">選項</label><input value={editOptions} onChange={e => setEditOptions(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" /></div>
                )}
              </>
            )}
            {editType === 'question_group' && <SubQuestionEditor subQuestions={editSubQuestions} setSubQuestions={setEditSubQuestions} />}
            <div className="mb-3 mt-3"><label className="text-xs text-[#8C7A6B]">詳解</label><textarea value={editExplanation} onChange={e => setEditExplanation(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded px-3 py-2 text-[#4A3F35]" rows={2} /></div>"""

if target_edit in content:
    content = content.replace(target_edit, replacement_edit)
    print("PATCH EDIT")
else:
    print("EDIT NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
