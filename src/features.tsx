import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, UploadTask } from 'firebase/storage';
import Markdown from 'react-markdown';
import type { UserProfile, Subject } from './App';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, Video, FileText, MessageCircle, Send, Award, Trash, Star, Play, CheckCircle, ChevronRight, Layout, Info, User, Volume2, Calendar, Paperclip, Download, Plus, X, Upload } from 'lucide-react';
import { toast } from './toast';
import { googleSignIn, getAccessToken } from './auth';
import { confirmModal } from './confirm';

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
}

export interface MaterialProgress {
  id?: string;
  userId: string;
  materialId: string;
  subjectId: string;
  completed: boolean;
  timeSpent: number;
  notes: string;
  highlights: string[];
  lastUpdated: number;
}

export interface CourseMaterial {
  id?: string;
  subjectId: string;
  unit: number;
  type: 'video' | 'pdf' | 'article' | 'lesson';
  title: string;
  contentUrl: string;
  description: string;
  markdownNotes?: string;
  attachments?: { name: string; url: string }[];
  createdAt: number;
}

export interface DiscussionMsg {
  id?: string;
  targetId: string; // can be a taskId, subjectId, or specific materialId
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

const SUBJECT_LABELS: Record<string, string> = {
  chinese: '國語',
  math: '數學',
  science: '自然',
  social_studies: '社會',
  ket: '英文檢定'
};

export function LandingPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    });
    return unsub;
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-[#4A3F35] text-[#FDFBF7] py-20 px-6 sm:px-12 rounded-b-[3rem] shadow-xl">
        <div className="max-w-[96%] mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl font-black font-serif leading-tight">
              探索知識的宇宙<br/><span className="text-[#C2A878]">數位學習平台</span>
            </h1>
            <p className="text-[#D5CFC4] text-lg max-w-md">
              結合最新多媒體教材與遊戲化測驗，先看課、後測驗。與同儕一起討論，獲取學習成就，讓學習不再枯燥！
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/select-subject')} className="bg-[#C2A878] text-[#4A3F35] px-8 py-3 rounded-full font-bold hover:bg-[#B39969] transition-all flex items-center gap-2">
                開始學習 <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C2A878] blur-3xl opacity-20 rounded-full"></div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Students learning" className="relative rounded-3xl shadow-2xl border-4 border-[#5A4F45] object-cover w-full h-[300px] md:h-[400px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="max-w-[96%] mx-auto py-16 px-6">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="text-[#C2A878]" size={28} />
          <h2 className="text-3xl font-bold text-[#4A3F35] font-serif">最新公告</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white border border-[#EAE6DF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-[#4A3F35] group-hover:text-[#B39969] transition-colors">{a.title}</h3>
              </div>
              <p className="text-[#8C7A6B] text-sm line-clamp-3">{a.content}</p>
              <div className="mt-4 pt-4 border-t border-[#EAE6DF] flex justify-between text-xs text-[#A69B8F]">
                <span>{a.author}</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="col-span-full text-center py-10 text-[#A69B8F]">目前沒有最新公告</div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="bg-[#FDFBF7] py-16 px-6">
        <div className="max-w-[96%] mx-auto">
          <h2 className="text-3xl font-bold text-[#4A3F35] font-serif mb-12 text-center">平台特色</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE6DF] text-center">
              <div className="bg-[#EAE2D3] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#B39969]">
                <Video size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4A3F35] mb-4">先看課、後測驗</h3>
              <p className="text-[#8C7A6B]">豐富的影音與圖文教材，讓學生在測驗前先建立扎實基礎，提升學習成效。</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE6DF] text-center">
              <div className="bg-[#EAE2D3] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#B39969]">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4A3F35] mb-4">師生即時討論</h3>
              <p className="text-[#8C7A6B]">專屬課程討論區，有問題隨時發問，老師與同學共同解答，營造共學氛圍。</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EAE6DF] text-center">
              <div className="bg-[#EAE2D3] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#B39969]">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4A3F35] mb-4">遊戲化成就系統</h3>
              <p className="text-[#8C7A6B]">解鎖徽章、累積經驗值升級，讓學習像玩遊戲一樣充滿成就感與動力。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsAdminTab() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const fetchAnnouncements = async () => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    await addDoc(collection(db, 'announcements'), {
      title, content, author: '系統管理員', createdAt: Date.now()
    });
    toast('發布成功！');
    setTitle(''); setContent('');
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (await confirmModal('確定刪除此公告？')) {
      await deleteDoc(doc(db, 'announcements', id));
      toast('刪除成功');
      fetchAnnouncements();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm space-y-4">
        <h3 className="font-bold text-[#4A3F35] text-lg">發布新公告</h3>
        <input type="text" placeholder="公告標題" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded-lg px-4 py-2" />
        <textarea placeholder="公告內容" value={content} onChange={e => setContent(e.target.value)} className="w-full bg-[#FDFBF7] border border-[#D5CFC4] rounded-lg px-4 py-2 h-32" />
        <button onClick={handlePost} className="bg-[#C2A878] text-[#4A3F35] px-6 py-2 rounded-lg font-bold hover:bg-[#B39969]">發布公告</button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#4A3F35] text-lg">歷史公告</h3>
        {announcements.map(a => (
          <div key={a.id} className="bg-white p-4 rounded-xl border border-[#EAE6DF] flex justify-between items-start">
            <div>
              <h4 className="font-bold text-[#4A3F35]">{a.title}</h4>
              <p className="text-sm text-[#8C7A6B] mt-1">{a.content}</p>
              <p className="text-xs text-[#A69B8F] mt-2">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => handleDelete(a.id!)} className="text-[#BC7665] hover:bg-[#FDFBF7] p-2 rounded-lg"><Trash size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseMaterialsAdminTab({ subjectId }: { subjectId: string }) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMat, setNewMat] = useState<Partial<CourseMaterial>>({ type: 'lesson', unit: 1, title: '', contentUrl: '', description: '', markdownNotes: '', attachments: [] });
  const [filterUnit, setFilterUnit] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'materials' | 'progress'>('materials');
  const [progressRecords, setProgressRecords] = useState<MaterialProgress[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  
  useEffect(() => {
    if (viewMode === 'progress') {
      const fetchProg = async () => {
        const q = query(collection(db, 'material_progress'), where('subjectId', '==', subjectId));
        const snap = await getDocs(q);
        setProgressRecords(snap.docs.map(d => d.data() as MaterialProgress));
        
        const qUsers = query(collection(db, 'users'));
        const snapUsers = await getDocs(qUsers);
        setStudents(snapUsers.docs.map(d => d.data() as UserProfile));
      };
      fetchProg();
    }
  }, [viewMode, subjectId]);

  const handleDrivePicker = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      } catch (e) {
        toast('Google登入失敗或已取消');
        return;
      }
    }

    if (!token) return;

    (window as any).gapi.load('picker', () => {
      const pickerOrigin = window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1] 
        : window.location.origin;
        
      const picker = new (window as any).google.picker.PickerBuilder()
        .addView((window as any).google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        .setCallback((data: any) => {
          if (data.action === (window as any).google.picker.Action.PICKED) {
            const files = data.docs;
            const newAttachments = files.map((f: any) => ({
              name: f.name,
              url: f.url
            }));
            setNewMat(prev => ({
              ...prev,
              attachments: [...(prev.attachments || []), ...newAttachments]
            }));
            toast(`已加入 ${files.length} 個雲端檔案`);
          }
        })
        .setOrigin(pickerOrigin)
        .build();
      picker.setVisible(true);
    });
  };


  const fetchMats = async () => {
    const q = query(collection(db, 'materials'), where('subjectId', '==', subjectId));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseMaterial));
    data.sort((a, b) => a.unit - b.unit || b.createdAt - a.createdAt);
    setMaterials(data);
  };

  useEffect(() => { fetchMats(); }, [subjectId]);

  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');

  const handleAddAttachmentLink = () => {
    if (!newAttName || !newAttUrl) {
      toast('請填寫檔案名稱與連結');
      return;
    }
    setNewMat(prev => ({ ...prev, attachments: [...(prev.attachments || []), { name: newAttName, url: newAttUrl }] }));
    setNewAttName('');
    setNewAttUrl('');
    toast('已加入附件連結');
  };

  const removeAttachment = (index: number) => {
    const newAtt = [...(newMat.attachments || [])];
    newAtt.splice(index, 1);
    setNewMat({ ...newMat, attachments: newAtt });
  };

  const handleSave = async () => {
    if (!newMat.title) return toast('請填寫教材標題');
    if (editingId) {
      await updateDoc(doc(db, 'materials', editingId), {
        ...newMat
      });
      toast('更新成功');
    } else {
      await addDoc(collection(db, 'materials'), {
        ...newMat, subjectId, createdAt: Date.now()
      });
      toast('新增成功');
    }
    setShowForm(false);
    setEditingId(null);
    setNewMat({ type: 'lesson', unit: filterUnit === 'all' ? 1 : filterUnit as number, title: '', contentUrl: '', description: '', markdownNotes: '', attachments: [] });
    fetchMats();
  };

  const handleEdit = (m: CourseMaterial) => {
    setNewMat({ ...m, attachments: m.attachments || [], markdownNotes: m.markdownNotes || '' });
    setEditingId(m.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirmModal('確定刪除此教材？無法復原。')) {
      await deleteDoc(doc(db, 'materials', id));
      toast('刪除成功');
      fetchMats();
    }
  };

  const units = Array.from(new Set(materials.map(m => m.unit))).sort((a, b) => a - b);
  const filteredMats = filterUnit === 'all' ? materials : materials.filter(m => m.unit === filterUnit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h3 className="font-serif font-black text-2xl text-[#4A3F35]">綜合教材編輯系統</h3>
          <p className="text-[#8C7A6B] mt-1 text-sm">支援影片、Markdown 筆記、多檔案上傳，打造豐富的線上課程體驗。</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setViewMode(viewMode === 'materials' ? 'progress' : 'materials')} className="bg-[#FDFBF7] text-[#8C7A6B] border border-[#EAE6DF] px-6 py-2 rounded-lg font-bold hover:bg-[#F5F5F0] transition-all shadow-sm">
            {viewMode === 'materials' ? '查看學生進度' : '返回教材編輯'}
          </button>
          {viewMode === 'materials' && <button onClick={() => {
          if (showForm) {
            setShowForm(false); setEditingId(null);
          } else {
            setNewMat({ type: 'lesson', unit: filterUnit === 'all' ? 1 : filterUnit as number, title: '', contentUrl: '', description: '', markdownNotes: '', attachments: [] });
            setShowForm(true);
          }
        }} className="bg-[#C2A878] text-[#4A3F35] px-6 py-2 rounded-lg font-bold hover:bg-[#B39969] transition-all shadow-sm flex items-center gap-2 shrink-0">
          <Plus size={18} /> {showForm && !editingId ? '取消' : editingId ? '取消編輯' : '新增教材'}
        </button>}
        </div>

      </div>

            {viewMode === 'progress' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE6DF] shadow-sm">
          <h4 className="font-bold text-lg text-[#4A3F35] mb-4 flex items-center gap-2"><BookOpen size={20} className="text-[#C2A878]" /> 學生學習進度追蹤</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-[#EAE6DF] text-[#8C7A6B] text-sm font-bold uppercase tracking-wider">
                  <th className="p-3">學生姓名</th>
                  <th className="p-3">教材</th>
                  <th className="p-3">完成狀態</th>
                  <th className="p-3">停留時間</th>
                  <th className="p-3">重點與筆記</th>
                  <th className="p-3">最後更新</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {progressRecords.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-6 text-[#A69B8F]">尚未有學習紀錄</td></tr>
                )}
                {progressRecords.sort((a, b) => b.lastUpdated - a.lastUpdated).map((p, i) => {
                  const s = students.find(u => u.uid === p.userId);
                  const m = materials.find(m => m.id === p.materialId);
                  return (
                    <tr key={i} className="border-b border-[#F5F5F0] hover:bg-[#FDFBF7] transition-colors">
                      <td className="p-3 font-bold text-[#4A3F35]">{s?.displayName || '未知使用者'}</td>
                      <td className="p-3 text-[#4A3F35] max-w-[200px] truncate" title={m?.title}>{m?.title || '未知教材'}</td>
                      <td className="p-3">
                        {p.completed ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={14}/> 已完成</span> : <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">學習中</span>}
                      </td>
                      <td className="p-3 text-[#8C7A6B] font-mono">{Math.floor(p.timeSpent / 60)}m {p.timeSpent % 60}s</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {p.highlights?.length > 0 && <div className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded border border-yellow-200 inline-block w-max">🖍️ {p.highlights.length} 個重點</div>}
                          {p.notes && <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-200 max-w-[150px] truncate" title={p.notes}>📝 {p.notes}</div>}
                          {!p.highlights?.length && !p.notes && <span className="text-[#D5CFC4] text-xs">無</span>}
                        </div>
                      </td>
                      <td className="p-3 text-[#A69B8F] text-xs font-mono">{new Date(p.lastUpdated).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {viewMode === 'materials' && (
      <>
{showForm && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EAE6DF] shadow-xl space-y-6 animate-in slide-in-from-top-4 relative z-10">
          <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-4">
            <BookOpen className="text-[#C2A878]" />
            <h4 className="font-bold text-xl text-[#4A3F35]">{editingId ? '編輯單元內容' : '新增單元內容'}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1 border-r-0 md:border-r border-[#EAE6DF] pr-0 md:pr-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8C7A6B]">所屬單元 (Unit)</label>
                <input type="number" value={newMat.unit} onChange={e => setNewMat({ ...newMat, unit: Number(e.target.value) })} className="w-full border border-[#EAE6DF] rounded-xl p-3 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none" min="1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8C7A6B]">教材類型</label>
                <select value={newMat.type} onChange={e => setNewMat({ ...newMat, type: e.target.value as any })} className="w-full border border-[#EAE6DF] rounded-xl p-3 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none">
                  <option value="lesson">綜合課程 (推薦)</option>
                  <option value="video">純影片</option>
                  <option value="pdf">純PDF</option>
                  <option value="article">純文章</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8C7A6B]">主標題</label>
                <input type="text" placeholder="例如：CH1-1 宇宙的起源" value={newMat.title} onChange={e => setNewMat({ ...newMat, title: e.target.value })} className="w-full border border-[#EAE6DF] rounded-xl p-3 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8C7A6B]">簡短描述</label>
                <textarea rows={3} placeholder="課程大綱或摘要..." value={newMat.description} onChange={e => setNewMat({ ...newMat, description: e.target.value })} className="w-full border border-[#EAE6DF] rounded-xl p-3 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8C7A6B]">主要影片 / 連結 URL (選填)</label>
                <input type="text" placeholder="YouTube 網址或雲端連結" value={newMat.contentUrl} onChange={e => setNewMat({ ...newMat, contentUrl: e.target.value })} className="w-full border border-[#EAE6DF] rounded-xl p-3 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none" />
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#8C7A6B]">Markdown 課程筆記</label>
                  <span className="text-xs text-[#A69B8F]">支援 Markdown 語法</span>
                </div>
                <textarea 
                  rows={8} 
                  placeholder="在此輸入豐富的課程內容...支援 **粗體**, # 標題, - 列表 等 Markdown 語法" 
                  value={newMat.markdownNotes || ''} 
                  onChange={e => setNewMat({ ...newMat, markdownNotes: e.target.value })} 
                  className="w-full border border-[#EAE6DF] rounded-xl p-4 bg-[#FDFBF7] focus:ring-2 focus:ring-[#C2A878] outline-none resize-y font-mono text-sm leading-relaxed" 
                />
              </div>

              <div className="space-y-3 bg-[#F5F5F0] p-4 rounded-2xl border border-[#EAE6DF]">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#4A3F35] flex items-center gap-2">
                    <Paperclip size={16} /> 附加外部檔案連結 ({newMat.attachments?.length || 0})
                  </label>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#8C7A6B]">可手動新增外部連結，或直接從 Google 雲端硬碟選取。</p>
                    <button type="button" onClick={handleDrivePicker} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-blue-200">
                      從雲端硬碟選取
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input 
                      type="text" 
                      placeholder="檔案名稱 (例如：講義 PDF)" 
                      className="px-3 py-2 rounded-xl border border-[#D1CCC5] flex-1 text-sm bg-white"
                      value={newAttName}
                      onChange={e => setNewAttName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="檔案連結 (URL)" 
                      className="px-3 py-2 rounded-xl border border-[#D1CCC5] flex-1 text-sm bg-white"
                      value={newAttUrl}
                      onChange={e => setNewAttUrl(e.target.value)}
                    />
                    <button 
                      onClick={handleAddAttachmentLink}
                      className="px-4 py-2 bg-[#4A3F35] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-[#3A3129]"
                    >
                      <Plus size={16} /> 加入
                    </button>
                  </div>
                </div>
                
                {newMat.attachments && newMat.attachments.length > 0 ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {newMat.attachments.map((att, i) => (
                      <div key={`att-${i}`} className="flex items-center justify-between bg-white p-2 px-3 rounded-lg border border-[#EAE6DF] text-sm">
                        <div className="flex-1 min-w-0 mr-2 flex flex-col">
                          <span className="truncate text-[#4A3F35] font-bold" title={att.name}>{att.name}</span>
                          <span className="truncate text-xs text-[#8C7A6B]" title={att.url}>{att.url}</span>
                        </div>
                        <button onClick={() => removeAttachment(i)} className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-[#A69B8F] border-2 border-dashed border-[#D1CCC5] rounded-xl mt-2">
                    尚未加入任何附件
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EAE6DF]">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2 rounded-lg text-[#8C7A6B] font-bold hover:bg-[#F5F5F0]">取消</button>
            <button onClick={handleSave} className="bg-[#4A3F35] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#2A241E] shadow-md transition-all">
              儲存發布
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setFilterUnit('all')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterUnit === 'all' ? 'bg-[#4A3F35] text-white shadow-md' : 'bg-white text-[#8C7A6B] border border-[#EAE6DF] hover:bg-[#F5F5F0]'}`}>全部單元</button>
            {units.map(u => (
              <button key={u} onClick={() => setFilterUnit(u)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterUnit === u ? 'bg-[#4A3F35] text-white shadow-md' : 'bg-white text-[#8C7A6B] border border-[#EAE6DF] hover:bg-[#F5F5F0]'}`}>Unit {u}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMats.map(m => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#F5F5F0] text-[#8C7A6B] text-xs font-bold px-2 py-1 rounded-md">Unit {m.unit}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(m)} className="p-1.5 text-[#8C7A6B] hover:text-[#4A3F35] hover:bg-[#F5F5F0] rounded-md transition-colors"><BookOpen size={16} /></button>
                    <button onClick={() => handleDelete(m.id!)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash size={16} /></button>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE6DF] text-[#C2A878]">
                    {m.type === 'video' ? <Video size={20} /> : m.type === 'pdf' ? <FileText size={20} /> : m.type === 'lesson' ? <Layout size={20} /> : <BookOpen size={20} />}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#4A3F35] leading-tight">{m.title}</h5>
                    <p className="text-sm text-[#8C7A6B] mt-1 line-clamp-2">{m.description}</p>
                    
                    <div className="flex gap-3 mt-3 text-xs text-[#A69B8F] font-medium">
                      {m.attachments && m.attachments.length > 0 && (
                        <span className="flex items-center gap-1"><Paperclip size={12}/> {m.attachments.length} 個附件</span>
                      )}
                      {m.markdownNotes && (
                        <span className="flex items-center gap-1"><FileText size={12}/> 筆記</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredMats.length === 0 && (
              <div className="col-span-full py-12 text-center bg-[#FDFBF7] rounded-3xl border border-dashed border-[#D1CCC5]">
                <BookOpen className="mx-auto text-[#D1CCC5] mb-2" size={32} />
                <p className="text-[#8C7A6B] font-bold">此單元目前沒有教材</p>
                <p className="text-sm text-[#A69B8F] mt-1">點擊右上方新增教材按鈕開始建立</p>
              </div>
            )}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export function CourseMaterialsStudentView({ subjectId, user }: { subjectId: string, user: UserProfile }) {
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
  
  const notesTextRef = useRef(notesText);
  notesTextRef.current = notesText;
  
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;

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
      // timeSpentRef, notesText, and highlights are set when the user clicks to open the material
      
      timerIntervalRef.current = setInterval(() => {
        timeSpentRef.current += 1;
      }, 1000);

      // Auto-save every 10 seconds
      const saveInterval = setInterval(() => {
         saveProgress(activeMat.id!, { timeSpent: timeSpentRef.current, notes: notesTextRef.current, highlights: highlightsRef.current });
      }, 10000);

      return () => {
        clearInterval(timerIntervalRef.current);
        clearInterval(saveInterval);
        saveProgress(activeMat.id!, { timeSpent: timeSpentRef.current, notes: notesTextRef.current, highlights: highlightsRef.current });
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
                  onClick={() => { 
                    setActiveMat(m); 
                    setIsFullscreen(true); 
                    const p = progressData[m.id!];
                    timeSpentRef.current = p?.timeSpent || 0;
                    setNotesText(p?.notes || "");
                    setHighlights(p?.highlights || []);
                  }}
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
export function GamificationProfile({ user }: { user: UserProfile }) {
  const xp = user.points || 0;
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
      <div className="relative w-24 h-24 rounded-full bg-[#EAE2D3] flex items-center justify-center border-4 border-[#C2A878]">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User size={40} className="text-[#B39969]" />
        )}
        <div className="absolute -bottom-2 bg-[#4A3F35] text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">
          Lv. {level}
        </div>
      </div>
      <div className="flex-1 w-full space-y-2">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-[#4A3F35] font-serif">{user.displayName}</h2>
          <span className="text-sm font-bold text-[#8C7A6B]">{xp} XP</span>
        </div>
        <div className="w-full bg-[#FDFBF7] h-3 rounded-full overflow-hidden border border-[#EAE6DF]">
          <div className="bg-gradient-to-r from-[#C2A878] to-[#B39969] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, progress)}%` }}></div>
        </div>
        <p className="text-xs text-right text-[#A69B8F]">距離升級還需 {nextLevelXp - xp} XP</p>
      </div>
      <div className="w-full md:w-auto flex gap-2 justify-start md:justify-end border-t md:border-t-0 md:border-l border-[#EAE6DF] pt-4 md:pt-0 md:pl-6">
        {user.badges && user.badges.length > 0 ? (
          user.badges.slice(0,3).map((b, i) => (
             <div key={i} className="flex flex-col items-center gap-1 group relative">
               <div className="bg-gradient-to-br from-[#FDFBF7] to-[#EAE2D3] border border-[#C2A878] p-2 rounded-full shadow-sm text-[#C2A878]">
                 <Award size={24} />
               </div>
               <span className="text-[10px] text-[#8C7A6B] font-bold text-center leading-tight whitespace-pre-wrap w-16">{BADGE_LABELS[b] || b}</span>
             </div>
          ))
        ) : (
          <div className="text-sm text-[#A69B8F] text-center w-full">完成任務解鎖徽章</div>
        )}
      </div>
    </div>
  );
}

