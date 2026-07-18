import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target_edit = """  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.correctAnswer);
    setEditOptions(q.options ? q.options.join(', ') : '');
    setEditUnit(q.unit);
    setEditDiff(q.difficulty);
    setEditType(q.type || 'multiple_choice');
    setEditMediaUrl(q.mediaUrl || '');
    setEditMediaType(q.mediaType || 'image');
    setEditExplanation(q.explanation || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editPrompt || !editAnswer) return;
    const options = editOptions.split(',').map(s => s.trim()).filter(s => s);
    try {
      const data: any = {
        unit: editUnit,
        difficulty: editDiff,
        type: editType,
        prompt: editPrompt,
        correctAnswer: editAnswer,
        mediaUrl: editMediaUrl,
        mediaType: editMediaType,
        explanation: editExplanation
      };
      if (editType === 'multiple_choice') data.options = options;
      else data.options = null;
      await updateDoc(doc(db, 'questions', editingId), data);
      setEditingId(null);
      onRefresh();
    } catch(e) { console.error(e); }
  };"""

replacement_edit = """  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.correctAnswer);
    setEditOptions(q.options ? q.options.join(', ') : '');
    setEditUnit(q.unit);
    setEditDiff(q.difficulty);
    setEditType(q.type || 'multiple_choice');
    setEditMediaUrl(q.mediaUrl || '');
    setEditMediaType(q.mediaType || 'image');
    setEditExplanation(q.explanation || '');
    setEditSubQuestions(q.subQuestions || []);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    if (editType === 'question_group') {
      if (!editPrompt || editSubQuestions.length === 0) return alert('請填寫文章內容與至少一題子問題');
      for (const sq of editSubQuestions) {
        if (!sq.prompt || !sq.correctAnswer) return alert('子問題必須包含題目與答案');
        if (sq.type === 'multiple_choice' && (!sq.options || sq.options.length === 0)) return alert('選擇題子問題需有選項');
        if (sq.type === 'multiple_choice' && !sq.options?.includes(sq.correctAnswer)) return alert('選擇題子問題正確答案必須在選項中');
      }
    } else {
      if (!editPrompt || !editAnswer) return alert('請填寫題目與答案');
    }

    const options = editOptions.split(',').map(s => s.trim()).filter(s => s);
    if (editType === 'multiple_choice' && options.length === 0) return alert('選擇題需有選項');
    if (editType === 'multiple_choice' && !options.includes(editAnswer)) return alert('正確答案必須在選項中');

    try {
      const data: any = {
        unit: editUnit,
        difficulty: editDiff,
        type: editType,
        prompt: editPrompt,
        correctAnswer: editType === 'question_group' ? '' : editAnswer,
        mediaUrl: editMediaUrl,
        mediaType: editMediaType,
        explanation: editExplanation
      };
      if (editType === 'multiple_choice') data.options = options;
      else data.options = null;
      
      if (editType === 'question_group') data.subQuestions = editSubQuestions;
      else data.subQuestions = null;
      
      await updateDoc(doc(db, 'questions', editingId), data);
      setEditingId(null);
      onRefresh();
    } catch(e) { console.error(e); }
  };"""

if target_edit in content:
    content = content.replace(target_edit, replacement_edit)
    print("EDIT PATCHED")
else:
    print("EDIT NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
