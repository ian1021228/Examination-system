import re

with open("src/App.tsx", "r") as f:
    content = f.read()

delete_func = """
  const handleJsonDelete = async () => {
    if (!textInput.trim()) return;
    setIsImporting(true);
    try {
      const data = JSON.parse(textInput);
      if (!Array.isArray(data)) throw new Error('內容必須是 JSON 陣列');
      
      const promptsToDelete = data.map((item: any) => item.prompt).filter(Boolean);
      if (promptsToDelete.length === 0) throw new Error('找不到要刪除的題目內容');

      const qSnapshot = await getDocs(query(collection(db, 'questions'), where('subject', '==', subjectId)));
      const questionsToDelete: string[] = [];
      qSnapshot.forEach(doc => {
        if (promptsToDelete.includes(doc.data().prompt)) {
          questionsToDelete.push(doc.id);
        }
      });

      if (questionsToDelete.length === 0) {
        toast('找不到吻合的題目');
        setIsImporting(false);
        return;
      }

      if (!(await confirmModal(`找到 ${questionsToDelete.length} 題吻合的題目，確定要刪除嗎？`))) {
        setIsImporting(false);
        return;
      }

      for (const id of questionsToDelete) {
        await deleteDoc(doc(db, 'questions', id));
      }
      
      toast(`成功刪除 ${questionsToDelete.length} 題！`);
      setTextInput('');
    } catch (err: any) {
      toast('刪除失敗: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };
"""

content = content.replace("const handleTextImport = async () => {", delete_func + "\n  const handleTextImport = async () => {")

buttons = """
        <div className="flex space-x-2">
          <button 
            onClick={handleTextImport} 
            disabled={isImporting || !textInput.trim()}
            className="bg-[#9BA8B5] hover:bg-[#8B98A5] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-[#4A3F35] font-bold transition-colors"
          >
            貼上文字匯入
          </button>
          <button 
            onClick={handleJsonDelete} 
            disabled={isImporting || !textInput.trim()}
            className="bg-[#BC7665] hover:bg-[#AC6655] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-bold transition-colors"
          >
            刪除吻合的題目
          </button>
        </div>
"""

old_button = """        <button 
          onClick={handleTextImport} 
          disabled={isImporting || !textInput.trim()}
          className="bg-[#9BA8B5] hover:bg-[#8B98A5] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-[#4A3F35] font-bold transition-colors"
        >
          貼上文字匯入
        </button>"""

content = content.replace(old_button, buttons.strip())

with open("src/App.tsx", "w") as f:
    f.write(content)
