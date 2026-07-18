import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Update state type
content = content.replace("const [type, setType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');",
                          "const [type, setType] = useState<'multiple_choice'|'fill_in_the_blank'|'mixed'>('multiple_choice');")

# Update select options
options_old = """        <select value={type} onChange={e => setType(e.target.value as any)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]">
          <option value="multiple_choice">選擇題</option>
          <option value="fill_in_the_blank">填空題</option>
        </select>"""

options_new = """        <select value={type} onChange={e => setType(e.target.value as any)} className="bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg px-4 py-2 text-[#4A3F35]">
          <option value="multiple_choice">選擇題</option>
          <option value="fill_in_the_blank">填空題</option>
          <option value="mixed">混合題型</option>
        </select>"""

content = content.replace(options_old, options_new)

# Update handleSave to use the returned `q.type`, `q.unit`, `q.difficulty` if provided
old_save = """    for (const q of generated) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        subject: subjectId,
        unit: 1, // Default to unit 1
        difficulty: 'medium',
        type,
        createdAt: Date.now()
      });
    }"""

new_save = """    for (const q of generated) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        subject: subjectId,
        unit: q.unit || 1,
        difficulty: q.difficulty || 'medium',
        type: q.type || (type === 'mixed' ? 'multiple_choice' : type),
        createdAt: Date.now()
      });
    }"""

content = content.replace(old_save, new_save)

with open("src/App.tsx", "w") as f:
    f.write(content)
