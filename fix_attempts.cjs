const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldDecl = `export function AttemptsTab({ attempts, questions, tasks }: { attempts: Attempt[], questions: Question[], tasks: Task[] }) {
  const [selectedTask, setSelectedTask] = useState<string>('all');
  const [search, setSearch] = useState('');`;

const newDecl = `export function AttemptsTab({ attempts, questions, tasks, onRefresh }: { attempts: Attempt[], questions: Question[], tasks: Task[], onRefresh: () => void }) {
  const [selectedTask, setSelectedTask] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const toggleSelectAttempt = (id: string) => {
    setSelectedAttempts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllAttempts = () => {
    if (selectedAttempts.length === searchedAttempts.length) {
      setSelectedAttempts([]);
    } else {
      setSelectedAttempts(searchedAttempts.map(a => a.id));
    }
  };

  const handleDeleteAttempts = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (!confirm(\`確定要刪除 \${ids.length} 筆紀錄嗎？此動作無法復原。\`)) return;
    setDeleting(true);
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, 'attempts', id));
      }
      setSelectedAttempts([]);
      onRefresh();
    } catch(e) {
      console.error(e);
      alert('刪除失敗');
    } finally {
      setDeleting(false);
    }
  };`;

if(code.includes(oldDecl)) {
    code = code.replace(oldDecl, newDecl);
    fs.writeFileSync('src/App.tsx', code);
    console.log('AttemptsTab declaration updated');
} else {
    console.log('AttemptsTab declaration not found');
}
