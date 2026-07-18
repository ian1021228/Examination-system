import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """    const mcSelected = selectedQs.filter((q: Question) => q.type === 'multiple_choice');
    const fibSelected = selectedQs.filter((q: Question) => q.type !== 'multiple_choice');

    let html = `
      <div style="font-family: 'Microsoft JhengHei', sans-serif; padding: 20px; color: #000;">
        <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">${SUBJECT_LABELS[subjectId as Subject] || '測驗'} 試卷</h1>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 16px;">
          <span>班級：__________ 座號：__________ 姓名：____________________</span>
          <span>得分：__________</span>
        </div>
    `;

    if (mcSelected.length > 0) {
      html += `
        <h2 style="font-size: 20px; margin-top: 20px; margin-bottom: 15px;">一、選擇題（共 ${mcSelected.length} 題）</h2>
        <div style="margin-left: 10px;">
      `;
      mcSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 15px; page-break-inside: avoid;">`;
        html += `<p style="font-size: 16px; margin: 0 0 8px 0;">${i + 1}. ( &nbsp;&nbsp; ) ${q.prompt.replace(/\[SOURCE_IMAGE\]/g, '')}</p>`;
        if (q.options && q.options.length > 0) {
          html += `<div style="display: flex; flex-wrap: wrap; gap: 15px; margin-left: 20px;">`;
          q.options.forEach((opt) => {
            html += `<div style="width: 45%;">${opt}</div>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (fibSelected.length > 0) {
      html += `
        <h2 style="font-size: 20px; margin-top: 30px; margin-bottom: 15px;">二、填空與問答題（共 ${fibSelected.length} 題）</h2>
        <div style="margin-left: 10px;">
      `;
      fibSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 25px; page-break-inside: avoid;">`;
        html += `<p style="font-size: 16px; margin: 0 0 10px 0;">${i + 1}. ${q.prompt.replace(/\[SOURCE_IMAGE\]/g, '')}</p>`;
        html += `<div style="border-bottom: 1px solid #000; width: 100%; height: 25px;"></div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Add Answer Key at the end
    html += `
        <div style="page-break-before: always; margin-top: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 15px; text-align: center;">解答</h2>
    `;
    if (mcSelected.length > 0) {
      html += `<h3 style="font-size: 16px;">一、選擇題</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">`;
      mcSelected.forEach((q, i) => {
        const correctIdx = q.options ? q.options.findIndex(o => o === q.correctAnswer) : -1;
        const letter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : q.correctAnswer;
        html += `<span style="font-size: 14px; width: 60px;">${i + 1}. ${letter}</span>`;
      });
      html += `</div>`;
    }
    if (fibSelected.length > 0) {
      html += `<h3 style="font-size: 16px;">二、填空與問答題</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">`;
      fibSelected.forEach((q, i) => {
        html += `<span style="font-size: 14px; width: 150px;">${i + 1}. ${q.correctAnswer}</span>`;
      });
      html += `</div>`;
    }
    html += `</div></div>`;"""

replacement = """    const mcSelected = selectedQs.filter((q: Question) => q.type === 'multiple_choice');
    const fibSelected = selectedQs.filter((q: Question) => q.type === 'fill_in_the_blank');
    const qgSelected = selectedQs.filter((q: Question) => q.type === 'question_group');

    let html = `
      <div style="font-family: 'Microsoft JhengHei', sans-serif; padding: 20px; color: #000;">
        <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">${SUBJECT_LABELS[subjectId as Subject] || '測驗'} 試卷</h1>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 16px;">
          <span>班級：__________ 座號：__________ 姓名：____________________</span>
          <span>得分：__________</span>
        </div>
    `;
    
    let sectionIdx = 1;
    const getSectionTitle = () => {
      const titles = ['一', '二', '三', '四'];
      return titles[(sectionIdx++) - 1] || sectionIdx;
    };

    if (mcSelected.length > 0) {
      html += `
        <h2 style="font-size: 20px; margin-top: 20px; margin-bottom: 15px;">${getSectionTitle()}、選擇題（共 ${mcSelected.length} 題）</h2>
        <div style="margin-left: 10px;">
      `;
      mcSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 15px; page-break-inside: avoid;">`;
        html += `<p style="font-size: 16px; margin: 0 0 8px 0;">${i + 1}. ( &nbsp;&nbsp; ) ${q.prompt.replace(/\[SOURCE_IMAGE\]/g, '')}</p>`;
        if (q.options && q.options.length > 0) {
          html += `<div style="display: flex; flex-wrap: wrap; gap: 15px; margin-left: 20px;">`;
          q.options.forEach((opt) => {
            html += `<div style="width: 45%;">${opt}</div>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (fibSelected.length > 0) {
      html += `
        <h2 style="font-size: 20px; margin-top: 30px; margin-bottom: 15px;">${getSectionTitle()}、填空與問答題（共 ${fibSelected.length} 題）</h2>
        <div style="margin-left: 10px;">
      `;
      fibSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 25px; page-break-inside: avoid;">`;
        html += `<p style="font-size: 16px; margin: 0 0 10px 0;">${i + 1}. ${q.prompt.replace(/\[SOURCE_IMAGE\]/g, '')}</p>`;
        html += `<div style="border-bottom: 1px solid #000; width: 100%; height: 25px;"></div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    if (qgSelected.length > 0) {
      html += `
        <h2 style="font-size: 20px; margin-top: 30px; margin-bottom: 15px;">${getSectionTitle()}、閱讀題組（共 ${qgSelected.length} 篇）</h2>
        <div style="margin-left: 10px;">
      `;
      qgSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<div style="font-size: 16px; margin: 0 0 15px 0; padding: 15px; border: 1px solid #ccc; background: #fdfdfd; line-height: 1.5; white-space: pre-wrap;">${q.prompt.replace(/\[SOURCE_IMAGE\]/g, '')}</div>`;
        if (q.subQuestions && q.subQuestions.length > 0) {
          html += `<div style="margin-left: 15px;">`;
          q.subQuestions.forEach((sq, sqIdx) => {
            html += `<div style="margin-bottom: 20px; page-break-inside: avoid;">`;
            if (sq.type === 'multiple_choice') {
              html += `<p style="font-size: 15px; margin: 0 0 8px 0;">${sqIdx + 1}. ( &nbsp;&nbsp; ) ${sq.prompt}</p>`;
              if (sq.options && sq.options.length > 0) {
                html += `<div style="display: flex; flex-wrap: wrap; gap: 15px; margin-left: 20px;">`;
                sq.options.forEach((opt) => {
                  html += `<div style="width: 45%;">${opt}</div>`;
                });
                html += `</div>`;
              }
            } else {
              html += `<p style="font-size: 15px; margin: 0 0 10px 0;">${sqIdx + 1}. ${sq.prompt}</p>`;
              html += `<div style="border-bottom: 1px solid #000; width: 100%; height: 25px;"></div>`;
            }
            html += `</div>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Add Answer Key at the end
    html += `
        <div style="page-break-before: always; margin-top: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 15px; text-align: center;">解答</h2>
    `;
    sectionIdx = 1;
    if (mcSelected.length > 0) {
      html += `<h3 style="font-size: 16px;">${getSectionTitle()}、選擇題</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">`;
      mcSelected.forEach((q, i) => {
        const correctIdx = q.options ? q.options.findIndex(o => o === q.correctAnswer) : -1;
        const letter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : q.correctAnswer;
        html += `<span style="font-size: 14px; width: 60px;">${i + 1}. ${letter}</span>`;
      });
      html += `</div>`;
    }
    if (fibSelected.length > 0) {
      html += `<h3 style="font-size: 16px;">${getSectionTitle()}、填空與問答題</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">`;
      fibSelected.forEach((q, i) => {
        html += `<span style="font-size: 14px; width: 150px;">${i + 1}. ${q.correctAnswer}</span>`;
      });
      html += `</div>`;
    }
    if (qgSelected.length > 0) {
      html += `<h3 style="font-size: 16px;">${getSectionTitle()}、閱讀題組</h3><div style="margin-bottom: 20px;">`;
      qgSelected.forEach((q, i) => {
        html += `<div style="margin-bottom: 10px;"><strong>第 ${i + 1} 篇</strong><div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 5px;">`;
        if (q.subQuestions) {
          q.subQuestions.forEach((sq, sqIdx) => {
            if (sq.type === 'multiple_choice') {
              const correctIdx = sq.options ? sq.options.findIndex(o => o === sq.correctAnswer) : -1;
              const letter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : sq.correctAnswer;
              html += `<span style="font-size: 14px; width: 60px;">${sqIdx + 1}. ${letter}</span>`;
            } else {
              html += `<span style="font-size: 14px; width: 150px;">${sqIdx + 1}. ${sq.correctAnswer}</span>`;
            }
          });
        }
        html += `</div></div>`;
      });
      html += `</div>`;
    }
    html += `</div></div>`;"""

if target in content:
    content = content.replace(target, replacement)
    print("EXPORT PATCHED")
else:
    print("EXPORT NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
