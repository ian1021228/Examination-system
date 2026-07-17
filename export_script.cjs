const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldExport = `const exportQuestions = (format: 'pdf' | 'docx') => {
    if (questions.length === 0) return alert('沒有題庫資料');
    let html = \`<div style="text-align:center; margin-bottom:20px;"><h2 style="color:#4b5563; font-size:24px;">題庫總覽</h2><p style="color:#6b7280; font-size:14px;">產出時間：\${new Date().toLocaleString('zh-TW')} | 共計：\${questions.length} 題</p></div>\`;
    
    html += \`<table style="width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed;">
      <thead>
        <tr style="background-color:#e0e7ff; color:#3730a3; text-align:center;">
          <th style="padding:8px; border:1px solid #a5b4fc; width:15%;">單元</th>
          <th style="padding:8px; border:1px solid #a5b4fc; width:45%;">題目</th>
          <th style="padding:8px; border:1px solid #a5b4fc; width:40%;">正確答案</th>
        </tr>
      </thead>
      <tbody>\`;

    for (const q of [...questions].sort((a, b) => a.unit - b.unit)) {
      html += \`<tr>
        <td style="padding:8px; border:1px solid #a5b4fc; text-align:center; font-weight:bold; color:#4338ca;">Unit \${q.unit}</td>
        <td style="padding:8px; border:1px solid #a5b4fc; color:#000000;">\${q.prompt}</td>
        <td style="padding:8px; border:1px solid #a5b4fc; color:#4b5563;">\${q.correctAnswer}</td>
      </tr>\`;
    }
    html += \`</tbody></table>\`;

    if (format === 'docx') {
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent("<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>題庫表</title><style>body{font-family:'Microsoft JhengHei',sans-serif;}</style></head><body>" + html + "</body></html>");
      const link = document.createElement("a"); link.href = source; link.download = \`題庫表_\${Date.now()}.doc\`; link.click();
    } else {
      const opt: any = { margin: 10, filename: \`題庫表_\${Date.now()}.pdf\`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      const element = document.createElement('div');
      element.innerHTML = \`<div style="font-family:'Microsoft JhengHei',sans-serif; padding:10px; color:#000000;">\${html}</div>\`;
      html2pdf().set(opt).from(element).save();
    }
  };`;

const newExport = `const exportQuestions = (format: 'pdf' | 'docx' | 'csv' | 'xlsx' | 'json') => {
    if (questions.length === 0) return alert('沒有題庫資料');
    
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", \`題庫_\${Date.now()}.json\`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      return;
    }

    if (format === 'csv') {
      let csvContent = "data:text/csv;charset=utf-8,\\uFEFF單元,難度,題型,題目,正確答案,選項,提示\\n";
      questions.forEach(q => {
        const row = [
          q.unit,
          q.difficulty,
          q.type,
          \`"\${q.prompt.replace(/"/g, '""')}"\`,
          \`"\${q.correctAnswer.replace(/"/g, '""')}"\`,
          \`"\${(q.options||[]).join(',').replace(/"/g, '""')}"\`,
          \`"\${(q.clue||'').replace(/"/g, '""')}"\`
        ].join(',');
        csvContent += row + "\\n";
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", \`題庫_\${Date.now()}.csv\`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    if (format === 'xlsx') {
      const wsData = questions.map(q => ({
        單元: q.unit,
        難度: q.difficulty === 'easy' ? '簡單' : q.difficulty === 'medium' ? '中等' : '困難',
        題型: q.type === 'multiple_choice' ? '選擇題' : '填空題',
        題目: q.prompt,
        正確答案: q.correctAnswer,
        選項: (q.options || []).join(', '),
        提示: q.clue || ''
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "題庫");
      XLSX.writeFile(wb, \`題庫_\${Date.now()}.xlsx\`);
      return;
    }

    let html = \`<div style="text-align:center; margin-bottom:20px;"><h2 style="color:#4b5563; font-size:24px;">題庫總覽</h2><p style="color:#6b7280; font-size:14px;">產出時間：\${new Date().toLocaleString('zh-TW')} | 共計：\${questions.length} 題</p></div>\`;
    
    html += \`<table style="width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed;">
      <thead>
        <tr style="background-color:#e0e7ff; color:#3730a3; text-align:center;">
          <th style="padding:8px; border:1px solid #a5b4fc; width:15%;">單元</th>
          <th style="padding:8px; border:1px solid #a5b4fc; width:45%;">題目</th>
          <th style="padding:8px; border:1px solid #a5b4fc; width:40%;">正確答案</th>
        </tr>
      </thead>
      <tbody>\`;

    for (const q of [...questions].sort((a, b) => a.unit - b.unit)) {
      html += \`<tr>
        <td style="padding:8px; border:1px solid #a5b4fc; text-align:center; font-weight:bold; color:#4338ca;">Unit \${q.unit}</td>
        <td style="padding:8px; border:1px solid #a5b4fc; color:#000000;">\${q.prompt}</td>
        <td style="padding:8px; border:1px solid #a5b4fc; color:#4b5563;">\${q.correctAnswer}</td>
      </tr>\`;
    }
    html += \`</tbody></table>\`;

    if (format === 'docx') {
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent("<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>題庫表</title><style>body{font-family:'Microsoft JhengHei',sans-serif;}</style></head><body>" + html + "</body></html>");
      const link = document.createElement("a"); link.href = source; link.download = \`題庫表_\${Date.now()}.doc\`; link.click();
    } else {
      const opt: any = { margin: 10, filename: \`題庫表_\${Date.now()}.pdf\`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      const element = document.createElement('div');
      element.innerHTML = \`<div style="font-family:'Microsoft JhengHei',sans-serif; padding:10px; color:#000000;">\${html}</div>\`;
      html2pdf().set(opt).from(element).save();
    }
  };`;

code = code.replace(oldExport, newExport);

const oldButtons = `<button onClick={() => exportQuestions('pdf')} className="bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 PDF">匯出 PDF</button>
          <button onClick={() => exportQuestions('docx')} className="bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 DOCX">匯出 DOCX</button>`;

const newButtons = `<button onClick={() => exportQuestions('pdf')} className="bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 PDF">PDF</button>
          <button onClick={() => exportQuestions('docx')} className="bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 DOCX">DOCX</button>
          <button onClick={() => exportQuestions('csv')} className="bg-green-500/10 hover:bg-green-500/30 text-green-400 border border-green-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 CSV">CSV</button>
          <button onClick={() => exportQuestions('xlsx')} className="bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 XLSX">XLSX</button>
          <button onClick={() => exportQuestions('json')} className="bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded text-sm font-bold transition-all" title="匯出成 JSON">JSON</button>`;

code = code.replace(oldButtons, newButtons);

const oldAttemptRow = `<td className="p-4 text-blue-400">{a.correctCount !== undefined ? \`\${a.correctCount} / \${a.totalAnswered}\` : '-'}</td>`;

const newAttemptRow = `<td className="p-4 text-blue-400">{a.correctCount !== undefined ? \`\${a.correctCount} / \${a.totalAnswered}\` : (a.answers ? \`\${a.answers.filter(ans=>ans.isCorrect).length} / \${a.answers.length}\` : \`\${Math.round(a.accuracy * (a.totalAnswered||a.score/100) / 100)} / \${a.totalAnswered || a.score/100}\`)}</td>`;

code = code.replace(oldAttemptRow, newAttemptRow);

const oldGameOverAttempt = `<p className="text-3xl font-black text-blue-400 mt-1">{attempt.correctCount !== undefined ? \`\${attempt.correctCount} / \${attempt.totalAnswered}\` : '-'}</p>`;

const newGameOverAttempt = `<p className="text-3xl font-black text-blue-400 mt-1">{attempt.correctCount !== undefined ? \`\${attempt.correctCount} / \${attempt.totalAnswered}\` : (attempt.answers ? \`\${attempt.answers.filter(ans=>ans.isCorrect).length} / \${attempt.answers.length}\` : \`\${Math.round(attempt.accuracy * (attempt.totalAnswered||attempt.score/100) / 100)} / \${attempt.totalAnswered || attempt.score/100}\`)}</p>`;

code = code.replace(oldGameOverAttempt, newGameOverAttempt);

fs.writeFileSync('src/App.tsx', code);
console.log('done exporting script');
