import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target_add = """  const handleAdd = async () => {
    if (!newPrompt || !newAnswer) return alert('請填寫題目與答案');
    const options = newOptions.split(',').map(s => s.trim()).filter(s => s);
    if (newType === 'multiple_choice' && options.length === 0) return alert('選擇題需有選項');
    if (newType === 'multiple_choice' && !options.includes(newAnswer)) return alert('正確答案必須在選項中');

    try {
      const data: any = {
        subject: subjectId,
        unit: newUnit,
        difficulty: newDiff,
        type: newType,
        prompt: newPrompt,
        correctAnswer: newAnswer,
        mediaUrl: newMediaUrl,
        mediaType: newMediaType,
        explanation: newExplanation
      };
      if (newType === 'multiple_choice') data.options = options;
      await addDoc(collection(db, 'questions'), data);
      setShowAddForm(false);
      setNewPrompt(''); setNewAnswer(''); setNewOptions(''); setNewMediaUrl(''); setNewExplanation('');
      onRefresh();
    } catch(e) { console.error(e); }
  };"""

replacement_add = """  const handleAdd = async () => {
    if (newType === 'question_group') {
      if (!newPrompt || newSubQuestions.length === 0) return alert('請填寫文章內容與至少一題子問題');
      for (const sq of newSubQuestions) {
        if (!sq.prompt || !sq.correctAnswer) return alert('子問題必須包含題目與答案');
        if (sq.type === 'multiple_choice' && (!sq.options || sq.options.length === 0)) return alert('選擇題子問題需有選項');
        if (sq.type === 'multiple_choice' && !sq.options?.includes(sq.correctAnswer)) return alert('選擇題子問題正確答案必須在選項中');
      }
    } else {
      if (!newPrompt || !newAnswer) return alert('請填寫題目與答案');
    }

    const options = newOptions.split(',').map(s => s.trim()).filter(s => s);
    if (newType === 'multiple_choice' && options.length === 0) return alert('選擇題需有選項');
    if (newType === 'multiple_choice' && !options.includes(newAnswer)) return alert('正確答案必須在選項中');

    try {
      const data: any = {
        subject: subjectId,
        unit: newUnit,
        difficulty: newDiff,
        type: newType,
        prompt: newPrompt,
        correctAnswer: newType === 'question_group' ? '' : newAnswer,
        mediaUrl: newMediaUrl,
        mediaType: newMediaType,
        explanation: newExplanation
      };
      if (newType === 'multiple_choice') data.options = options;
      if (newType === 'question_group') data.subQuestions = newSubQuestions;
      await addDoc(collection(db, 'questions'), data);
      setShowAddForm(false);
      setNewPrompt(''); setNewAnswer(''); setNewOptions(''); setNewMediaUrl(''); setNewExplanation(''); setNewSubQuestions([]);
      onRefresh();
    } catch(e) { console.error(e); }
  };"""

if target_add in content:
    content = content.replace(target_add, replacement_add)
    print("ADD PATCHED")
else:
    print("ADD NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
