import re

with open("src/features.tsx", "r") as f:
    content = f.read()

# We will completely replace the CourseMaterialsStudentView
# Let's extract the old one first

start_idx = content.find("export function CourseMaterialsStudentView")
# find the next export function
end_idx = content.find("export function GamificationProfile", start_idx)

if start_idx != -1 and end_idx != -1:
    old_func = content[start_idx:end_idx]
    
    new_func = """export function CourseMaterialsStudentView({ subjectId, user }: { subjectId: string, user: UserProfile }) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [activeMat, setActiveMat] = useState<CourseMaterial | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewAtt, setPreviewAtt] = useState<{name: string, url: string} | null>(null);
  const [progressData, setProgressData] = useState<Record<string, MaterialProgress>>({});
  
  // Notes & Highlight state
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  
  // Timer state
  const timeSpentRef = useRef(0);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    const fetchMats = async () => {
      const q = query(collection(db, 'materials'), where('subjectId', '==', subjectId));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseMaterial));
      data.sort((a, b) => a.unit - b.unit || b.createdAt - a.createdAt);
      setMaterials(data);
      if (data.length > 0 && !activeMat) {
        setActiveMat(data[0]);
      }
    };
    fetchMats();
  }, [subjectId]);

  // Fetch progress
  useEffect(() => {
    if (!user?.uid || !subjectId) return;
    const q = query(collection(db, 'material_progress'), where('subjectId', '==', subjectId), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const prog: Record<string, MaterialProgress> = {};
      snap.forEach(doc => {
        const d = doc.data() as MaterialProgress;
        prog[d.materialId] = { id: doc.id, ...d };
      });
      setProgressData(prog);
    });
    return () => unsubscribe();
  }, [subjectId, user?.uid]);

  // Timer logic
  useEffect(() => {
    if (isFullscreen && activeMat) {
      const currentProg = progressData[activeMat.id!] || null;
      timeSpentRef.current = currentProg?.timeSpent || 0;
      setNotesText(currentProg?.notes || "");
      setHighlights(currentProg?.highlights || []);
      
      timerIntervalRef.current = setInterval(() => {
        timeSpentRef.current += 1;
      }, 1000);

      // Auto-save every 10 seconds
      const saveInterval = setInterval(() => {
         saveProgress(activeMat.id!, { timeSpent: timeSpentRef.current, notes: notesText, highlights });
      }, 10000);

      return () => {
        clearInterval(timerIntervalRef.current);
        clearInterval(saveInterval);
        saveProgress(activeMat.id!, { timeSpent: timeSpentRef.current, notes: notesText, highlights });
      };
    }
  }, [isFullscreen, activeMat]);

  // Make sure we save when notes change, but debounced or on blur is better.
  // For simplicity, we just save on unmount or auto-save.

  const saveProgress = async (matId: string, data: Partial<MaterialProgress>) => {
    if (!user?.uid) return;
    const existing = progressData[matId];
    try {
      if (existing?.id) {
        await updateDoc(doc(db, 'material_progress', existing.id), {
          ...data,
          lastUpdated: Date.now()
        });
      } else {
        await addDoc(collection(db, 'material_progress'), {
          userId: user.uid,
          materialId: matId,
          subjectId,
          completed: false,
          timeSpent: data.timeSpent || 0,
          notes: data.notes || "",
          highlights: data.highlights || [],
          lastUpdated: Date.now(),
          ...data
        });
      }
    } catch (e) {
      console.error("Error saving progress", e);
    }
  };

  const toggleCompleted = async (matId: string, completed: boolean) => {
    await saveProgress(matId, { completed, timeSpent: timeSpentRef.current });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      // Add a small highlight button tooltip could be implemented here, 
      // but for simplicity we will just let them click a button "Highlight Selected Text"
    }
  };
  
  const addHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      if (!highlights.includes(text)) {
        const newHighlights = [...highlights, text];
        setHighlights(newHighlights);
        saveProgress(activeMat!.id!, { highlights: newHighlights, timeSpent: timeSpentRef.current });
        toast("已畫重點！");
      }
    } else {
      toast("請先選取要畫重點的文字");
    }
  };

  const removeHighlight = (text: string) => {
    const newH = highlights.filter(h => h !== text);
    setHighlights(newH);
    saveProgress(activeMat!.id!, { highlights: newH, timeSpent: timeSpentRef.current });
  };

  // Effect to highlight text in DOM
  useEffect(() => {
    if (isFullscreen && activeMat && highlights.length > 0) {
      // Very basic highlight implementation: Wait for render, then highlight
      // Note: This is a hacky way to highlight in a React app without a library.
      // We will skip actual DOM manipulation to avoid breaking React.
      // Instead, we will just show the highlights in the side panel.
    }
  }, [isFullscreen, activeMat, highlights]);

  const units = Array.from(new Set(materials.map(m => m.unit))).sort((a, b) => a - b);

  if (isFullscreen && activeMat) {
    const isCompleted = progressData[activeMat.id!]?.completed || false;
    
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-[#FDFBF7] flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-[#EAE6DF] shadow-sm shrink-0">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="bg-[#4A3F35] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#3A3129] shadow-md transition-all"
            >
              <ChevronLeft size={20} />
              返回總覽
            </button>
            <div className="ml-6 flex-1 min-w-0 flex items-center gap-3">
              <span className="bg-[#F5F5F0] text-[#8C7A6B] text-xs font-bold px-2 py-1 rounded-md shrink-0">
                Unit {activeMat.unit}
              </span>
              <h1 className="font-bold text-lg text-[#4A3F35] truncate">
                {activeMat.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button 
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${showNotes ? 'bg-[#C2A878] text-white shadow-md' : 'bg-[#F5F5F0] text-[#8C7A6B] hover:bg-[#EAE6DF]'}`}
              >
                <BookOpen size={20} />
                筆記與重點
              </button>
             <button 
                onClick={() => toggleCompleted(activeMat.id!, !isCompleted)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${isCompleted ? 'bg-green-500 text-white shadow-md' : 'bg-[#F5F5F0] text-[#8C7A6B] hover:bg-[#EAE6DF]'}`}
              >
                <CheckCircle size={20} />
                {isCompleted ? '已完成' : '標示為完成'}
              </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-y-auto transition-all ${showNotes ? 'md:pr-[400px]' : ''}`} onMouseUp={handleTextSelection}>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 md:px-8 space-y-10 relative">
              {/* Highlight Toolbar */}
              {showNotes && (
                 <div className="sticky top-4 z-10 flex justify-end mb-4">
                    <button onClick={addHighlight} className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-yellow-300 flex items-center gap-2">
                      ✏️ 將選取的文字畫重點
                    </button>
                 </div>
              )}

              {activeMat.description && (
                <p className="text-[#8C7A6B] text-lg leading-relaxed">{activeMat.description}</p>
              )}

              {/* Media Content */}
              {activeMat.contentUrl && (
                <div className="rounded-2xl overflow-hidden shadow-lg border border-[#EAE6DF] bg-black">
                  {activeMat.contentUrl.includes('youtube.com') || activeMat.contentUrl.includes('youtu.be') ? (
                    <div className="aspect-video">
                      <iframe 
                        className="w-full h-full" 
                        src={`https://www.youtube.com/embed/${activeMat.contentUrl.split('v=')[1]?.split('&')[0] || activeMat.contentUrl.split('/').pop()}`} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  ) : activeMat.contentUrl.endsWith('.pdf') ? (
                    <div className="h-[80vh] w-full">
                      <iframe src={activeMat.contentUrl} className="w-full h-full bg-white" title="PDF Viewer" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-[#F5F5F0]">
                      <a href={activeMat.contentUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 text-[#C2A878] hover:text-[#B39969] transition-colors">
                        <Play size={48} className="drop-shadow-md" />
                        <span className="font-bold text-lg">開啟外部教材連結</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Notes */}
              {activeMat.markdownNotes && (
                <div className="prose prose-stone prose-h1:font-serif prose-h1:text-[#4A3F35] prose-h2:text-[#4A3F35] prose-a:text-[#C2A878] max-w-none bg-white p-8 md:p-12 rounded-3xl border border-[#EAE6DF] shadow-sm">
                  <Markdown>{activeMat.markdownNotes}</Markdown>
                </div>
              )}

              {/* Attachments */}
              {activeMat.attachments && activeMat.attachments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
                    <Paperclip size={20} className="text-[#C2A878]" /> 
                    課程附件
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeMat.attachments.map((att, i) => {
                      const isPdf = att.url.toLowerCase().split('?')[0].endsWith('.pdf');
                      const isVideo = att.url.toLowerCase().match(/\.(mp4|webm|ogg)$/) || att.url.includes('youtube.com') || att.url.includes('youtu.be');
                      const isPreviewable = isPdf || isVideo;
                      
                      return (
                        <div key={i} className="flex items-center bg-white rounded-2xl border border-[#EAE6DF] hover:border-[#C2A878] hover:shadow-md transition-all group overflow-hidden">
                          <a 
                            href={att.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 flex items-center gap-3 p-4 min-w-0"
                          >
                            <div className="bg-[#F5F5F0] text-[#8C7A6B] p-2 rounded-xl group-hover:bg-[#C2A878] group-hover:text-white transition-colors">
                              <Download size={20} />
                            </div>
                            <span className="font-bold text-[#4A3F35] truncate text-sm">
                              {att.name}
                            </span>
                          </a>
                          {isPreviewable && (
                            <button 
                              onClick={() => setPreviewAtt(att)}
                              className="px-4 py-4 text-[#8C7A6B] hover:text-[#C2A878] bg-[#FDFBF7] hover:bg-[#F5F5F0] transition-colors border-l border-[#EAE6DF]"
                              title="預覽"
                            >
                              <Play size={20} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Notes Sidebar */}
          {showNotes && (
             <div className="absolute right-0 top-[73px] bottom-0 w-full md:w-[400px] bg-white border-l border-[#EAE6DF] shadow-2xl flex flex-col z-20">
               <div className="p-4 border-b border-[#EAE6DF] flex justify-between items-center bg-[#FDFBF7]">
                 <h2 className="font-bold text-lg text-[#4A3F35] flex items-center gap-2">
                   <BookOpen size={20} /> 我的筆記
                 </h2>
                 <button onClick={() => setShowNotes(false)} className="text-[#8C7A6B] hover:text-[#4A3F35]">
                    <X size={20} />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                 <div>
                   <h3 className="font-bold text-sm text-[#8C7A6B] mb-2 uppercase tracking-wider">重點摘錄</h3>
                   {highlights.length === 0 ? (
                      <p className="text-sm text-[#A69B8F] italic">尚未標記任何重點。請在左側選取文字並點擊「將選取的文字畫重點」。</p>
                   ) : (
                      <ul className="space-y-2">
                        {highlights.map((h, idx) => (
                           <li key={idx} className="bg-yellow-100/50 border-l-4 border-yellow-400 p-3 rounded-r-lg text-sm text-[#4A3F35] relative group">
                             {h}
                             <button onClick={() => removeHighlight(h)} className="absolute top-2 right-2 text-yellow-600 opacity-0 group-hover:opacity-100 hover:text-red-500">
                               <Trash size={14} />
                             </button>
                           </li>
                        ))}
                      </ul>
                   )}
                 </div>
                 
                 <div className="flex-1 flex flex-col">
                   <h3 className="font-bold text-sm text-[#8C7A6B] mb-2 uppercase tracking-wider">個人筆記</h3>
                   <textarea
                     className="w-full flex-1 min-h-[300px] p-4 bg-[#F5F5F0] border-2 border-[#EAE6DF] rounded-xl focus:border-[#C2A878] focus:outline-none resize-none text-[#4A3F35]"
                     placeholder="在這裡寫下你的筆記..."
                     value={notesText}
                     onChange={(e) => setNotesText(e.target.value)}
                     onBlur={(e) => saveProgress(activeMat!.id!, { notes: e.target.value, timeSpent: timeSpentRef.current })}
                   />
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewAtt && (
          <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col backdrop-blur-sm">
            <div className="flex justify-end p-4">
              <button 
                onClick={() => setPreviewAtt(null)}
                className="text-white hover:text-[#C2A878] transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <X size={32} />
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
              {previewAtt.url.toLowerCase().split('?')[0].endsWith('.pdf') ? (
                <iframe src={previewAtt.url} className="w-full h-full max-w-5xl bg-white rounded-xl" title="PDF Preview" />
              ) : previewAtt.url.includes('youtube.com') || previewAtt.url.includes('youtu.be') ? (
                 <iframe 
                    className="w-full max-w-5xl aspect-video rounded-xl" 
                    src={`https://www.youtube.com/embed/${previewAtt.url.split('v=')[1]?.split('&')[0] || previewAtt.url.split('/').pop()}`} 
                    title="YouTube video player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
              ) : (
                <video src={previewAtt.url} controls className="max-w-full max-h-full rounded-xl" />
              )}
            </div>
          </div>
        )}
      </div>,
      document.body
    );
  }

  return (
    <div className="space-y-12">
      {units.map(u => (
        <div key={u} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DF] shadow-sm">
          <h2 className="text-2xl font-bold text-[#4A3F35] mb-6 flex items-center gap-3">
            <span className="bg-[#FDFBF7] text-[#C2A878] px-4 py-1.5 rounded-xl border border-[#EAE6DF] text-lg font-serif">Unit {u}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {materials.filter(m => m.unit === u).map(m => {
              const prog = progressData[m.id!];
              const isCompleted = prog?.completed || false;
              
              return (
                <div key={m.id} 
                  onClick={() => setActiveMat(m)}
                  className={`bg-[#FDFBF7] rounded-2xl p-5 border-2 transition-all cursor-pointer group relative overflow-hidden
                    ${isCompleted ? 'border-green-400' : 'border-[#EAE6DF] hover:border-[#C2A878] hover:shadow-md'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl shrink-0 transition-colors ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-white text-[#C2A878] group-hover:bg-[#C2A878] group-hover:text-white'}`}>
                      {isCompleted ? <CheckCircle size={28} /> : (
                        m.type === 'video' ? <Video size={28} /> : 
                        m.type === 'pdf' ? <FileText size={28} /> :
                        m.type === 'article' ? <BookOpen size={28} /> :
                        <BookOpen size={28} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-[#4A3F35] mb-1 group-hover:text-[#B39969] transition-colors truncate">
                        {m.title}
                      </h3>
                      <p className="text-sm text-[#8C7A6B] line-clamp-2 leading-relaxed">
                        {m.description || '點擊閱讀教材內容'}
                      </p>
                      
                      {prog && (
                        <div className="mt-3 flex items-center gap-3 text-xs text-[#A69B8F] font-mono">
                          {prog.timeSpent > 0 && <span>⏱️ {Math.floor(prog.timeSpent / 60)}m {prog.timeSpent % 60}s</span>}
                          {prog.notes && <span>📝 有筆記</span>}
                          {prog.highlights?.length > 0 && <span>🖍️ {prog.highlights.length} 個重點</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {materials.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE6DF]">
          <BookOpen size={48} className="mx-auto text-[#D5CFC4] mb-4" />
          <p className="text-xl text-[#A69B8F] font-bold">目前沒有教材</p>
          <p className="text-[#A69B8F] mt-2">請等待老師發布教材</p>
        </div>
      )}
    </div>
  );
}
"""
    
    content = content[:start_idx] + new_func + content[end_idx:]
    with open("src/features.tsx", "w") as f:
        f.write(content)
else:
    print("Could not find CourseMaterialsStudentView function.")
