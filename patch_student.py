import re

with open("src/features.tsx", "r") as f:
    content = f.read()

# 1. Remove initialization from useEffect
old_timer = """  // Timer logic
  useEffect(() => {
    if (isFullscreen && activeMat) {
      const currentProg = progressData[activeMat.id!] || null;
      timeSpentRef.current = currentProg?.timeSpent || 0;
      setNotesText(currentProg?.notes || "");
      setHighlights(currentProg?.highlights || []);
      
      timerIntervalRef.current = setInterval(() => {"""

new_timer = """  // Timer logic
  useEffect(() => {
    if (isFullscreen && activeMat) {
      // timeSpentRef, notesText, and highlights are set when the user clicks to open the material
      
      timerIntervalRef.current = setInterval(() => {"""

content = content.replace(old_timer, new_timer)

# 2. Update onClick
old_click = """                  onClick={() => { setActiveMat(m); setIsFullscreen(true); }}"""

new_click = """                  onClick={() => { 
                    setActiveMat(m); 
                    setIsFullscreen(true); 
                    const p = progressData[m.id!];
                    timeSpentRef.current = p?.timeSpent || 0;
                    setNotesText(p?.notes || "");
                    setHighlights(p?.highlights || []);
                  }}"""

content = content.replace(old_click, new_click)

with open("src/features.tsx", "w") as f:
    f.write(content)
