import re

with open("src/App.tsx", "r") as f:
    content = f.read()

func = """
  const downloadSkillTxt = () => {
    const text = `# Role
你是一位專業的教育測驗命題專家，專門設計高品質、符合教學邏輯的測驗題目。

# Task
請根據提供的「科目」、「單元大綱」與「期望題數」，生成題庫。請嚴格按照以下 JSON 格式產出。

# Generation Rules (命題規則)
1. 題型 (type)：必須混合產出以下三種題型：
   - 選擇題 (multiple_choice)：提供 4 個選項。
   - 填空題 (fill_in_the_blank)：題目中需使用底線（___）。
   - 題組 (question_group)：包含一段主文本（prompt）與數個子問題（subQuestions）。
2. 多媒體題 (Multimedia)：若適合搭配圖片、影片或音訊，可提供 mediaUrl 與 mediaType。mediaType 可填寫 image, youtube, 或 audio。
3. 每個物件必須包含單元 (unit)、難易度 (difficulty)、詳解 (explanation)。

# JSON Output Format
[
  {
    "prompt": "題目內容（若為填空題請留 ___）",
    "correctAnswer": "正確答案",
    "options": ["選項A", "選項B", "選項C", "選項D"], // 若無則省略
    "unit": 1,
    "difficulty": "easy", // easy, medium, hard
    "type": "multiple_choice", // multiple_choice, fill_in_the_blank, question_group
    "explanation": "解題詳解",
    "mediaUrl": "https://...", // 選填，例如圖片連結或YouTube連結
    "mediaType": "image", // image, youtube, audio (若有 mediaUrl 則必填)
    "subQuestions": [ // 僅在 type 為 question_group 時提供
      {
        "id": "sq1",
        "type": "multiple_choice",
        "prompt": "子問題1",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "子問題1詳解"
      }
    ]
  }
]`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
"""

target = "export function QuestionsTab({ questions, onRefresh, subjectId }: { questions: Question[], onRefresh: () => void, subjectId: Subject }) {"
replacement = target + func

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)
