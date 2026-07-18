import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """  const filteredQuestions = useMemo(() => {
    if (filterType === 'all') return questions;
    if (filterType === 'multimedia') return questions.filter(q => !!q.mediaUrl);
    return questions.filter(q => q.type === filterType);
  }, [questions, filterType]);"""

replacement = """  const filteredQuestions = useMemo(() => {
    let qs = questions;
    if (filterType !== 'all') {
      if (filterType === 'multimedia') qs = qs.filter(q => !!q.mediaUrl);
      else qs = qs.filter(q => q.type === filterType);
    }
    return [...qs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [questions, filterType]);"""

if target in content:
    content = content.replace(target, replacement)
    print("PATCHED SORT")
else:
    print("TARGET NOT FOUND")

with open("src/App.tsx", "w") as f:
    f.write(content)
