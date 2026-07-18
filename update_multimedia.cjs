const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Update Question interface
const oldInterface = `export interface Question {
  id: string;
  subject: Subject;
  unit: number; // e.g. 1, 2, 3
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'fill_in_the_blank';
  prompt: string; // The question text
  options?: string[]; // For multiple choice
  correctAnswer: string; // The exact answer text
  clue?: string; // Optional hint
  createdAt: number;
}`;
const newInterface = `export interface Question {
  id: string;
  subject: Subject;
  unit: number; // e.g. 1, 2, 3
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'fill_in_the_blank';
  prompt: string; // The question text
  options?: string[]; // For multiple choice
  correctAnswer: string; // The exact answer text
  clue?: string; // Optional hint
  imageUrl?: string; // Multimedia: Image URL
  audioUrl?: string; // Multimedia: Audio URL
  createdAt: number;
}`;
code = code.replace(oldInterface, newInterface);

// 2. Update QuestionsTab states
const oldQuestionsTabState = `  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUnit, setNewUnit] = useState(1);
  const [newDiff, setNewDiff] = useState<'easy'|'medium'|'hard'>('medium');
  const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newOptions, setNewOptions] = useState('');`;

const newQuestionsTabState = `  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAudioUrl, setEditAudioUrl] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUnit, setNewUnit] = useState(1);
  const [newDiff, setNewDiff] = useState<'easy'|'medium'|'hard'>('medium');
  const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');`;
code = code.replace(oldQuestionsTabState, newQuestionsTabState);

fs.writeFileSync('src/App.tsx', code);
console.log('done updating interface and state');
