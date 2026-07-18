import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# 1. QuestionsTab - handleAdd
content = content.replace("prompt: newPrompt,", "prompt: newPrompt.replace(/\\[SOURCE_IMAGE\\]/g, ''),")
# Clean subQuestions before saving
content = content.replace("if (newType === 'question_group') data.subQuestions = newSubQuestions;", 
                          "if (newType === 'question_group') data.subQuestions = newSubQuestions.map((sq: any) => ({...sq, prompt: sq.prompt.replace(/\\[SOURCE_IMAGE\\]/g, '')}));")

# 2. QuestionsTab - handleEdit
content = content.replace("prompt: editPrompt,", "prompt: editPrompt.replace(/\\[SOURCE_IMAGE\\]/g, ''),")
content = content.replace("if (editType === 'question_group') data.subQuestions = editSubQuestions;",
                          "if (editType === 'question_group') data.subQuestions = editSubQuestions.map((sq: any) => ({...sq, prompt: sq.prompt.replace(/\\[SOURCE_IMAGE\\]/g, '')}));")

# 3. AIGeneratorTab - handleSave
old_ai_save = """      await addDoc(collection(db, 'questions'), {
        ...q,"""
new_ai_save = """      await addDoc(collection(db, 'questions'), {
        ...q,
        prompt: q.prompt ? q.prompt.replace(/\\[SOURCE_IMAGE\\]/g, '') : '',"""
content = content.replace(old_ai_save, new_ai_save)

# 4. ImportTab - handleFileUpload
old_import = """      await addDoc(collection(db, 'questions'), {
        subject: subjectId,
        unit: parseInt(String(itemUnit)) || 1,
        difficulty: itemDiff,
        type: itemType,
        prompt: String(prompt),"""
new_import = """      await addDoc(collection(db, 'questions'), {
        subject: subjectId,
        unit: parseInt(String(itemUnit)) || 1,
        difficulty: itemDiff,
        type: itemType,
        prompt: String(prompt).replace(/\\[SOURCE_IMAGE\\]/g, ''),"""
content = content.replace(old_import, new_import)

# 5. ImportTab - handleConfirmImport
old_confirm = """        await addDoc(collection(db, 'questions'), {
          ...item,"""
new_confirm = """        await addDoc(collection(db, 'questions'), {
          ...item,
          prompt: item.prompt ? item.prompt.replace(/\\[SOURCE_IMAGE\\]/g, '') : '',"""
content = content.replace(old_confirm, new_confirm)

with open("src/App.tsx", "w") as f:
    f.write(content)
