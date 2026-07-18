const fs = require('fs');

// 1. Update index.css
let css = `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Noto Sans TC", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Noto Serif TC", ui-serif, Georgia, serif;
}

body {
  background-color: #FDFBF7;
  color: #4A3F35;
}
`;
fs.writeFileSync('src/index.css', css);

// 2. Update App.tsx theme and interfaces
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = {
  'bg-gray-900': 'bg-[#FDFBF7]',
  'bg-gray-950': 'bg-[#F5F5F0]',
  'bg-gray-800': 'bg-white',
  'bg-gray-700': 'bg-[#EAE6DF]',
  'border-gray-800': 'border-[#EAE6DF]',
  'border-gray-700': 'border-[#D5CFC4]',
  'border-gray-600': 'border-[#D5CFC4]',
  'text-white': 'text-[#4A3F35]',
  'text-gray-200': 'text-[#5A4F45]',
  'text-gray-300': 'text-[#6A5F55]',
  'text-gray-400': 'text-[#8C7A6B]',
  'text-gray-500': 'text-[#A69B8F]',
  'text-gray-600': 'text-[#B6AB9F]',
  'bg-purple-600': 'bg-[#C2A878]',
  'hover:bg-purple-500': 'hover:bg-[#B39969]',
  'text-purple-400': 'text-[#B39969]',
  'text-purple-300': 'text-[#B39969]',
  'bg-purple-900/50': 'bg-[#EAE2D3]',
  'border-purple-500/50': 'border-[#C2A878]/50',
  'bg-green-600': 'bg-[#82917B]',
  'hover:bg-green-500': 'hover:bg-[#72816B]',
  'text-green-400': 'text-[#72816B]',
  'bg-green-900/10': 'bg-[#82917B]/10',
  'bg-green-900/50': 'bg-[#82917B]/20',
  'border-green-500/20': 'border-[#82917B]/30',
  'bg-red-600': 'bg-[#BC7665]',
  'hover:bg-red-500': 'hover:bg-[#AC6655]',
  'text-red-400': 'text-[#BC7665]',
  'text-red-300': 'text-[#AC6655]',
  'bg-red-900/50': 'bg-[#BC7665]/20',
  'bg-red-900/10': 'bg-[#BC7665]/10',
  'bg-red-900/40': 'bg-[#BC7665]/15',
  'border-red-500/20': 'border-[#BC7665]/30',
  'border-red-500/40': 'border-[#BC7665]/40',
  'bg-blue-600': 'bg-[#9BA8B5]',
  'hover:bg-blue-600': 'hover:bg-[#8B98A5]',
  'hover:bg-blue-500': 'hover:bg-[#8B98A5]',
  'text-blue-400': 'text-[#7A8A99]',
  'bg-blue-500/10': 'bg-[#9BA8B5]/10',
  'border-blue-500/20': 'border-[#9BA8B5]/30',
  'bg-blue-700': 'bg-[#8B98A5]',
  'text-yellow-400': 'text-[#D4A373]',
  'bg-yellow-500/10': 'bg-[#D4A373]/10',
  'hover:bg-yellow-500/30': 'hover:bg-[#D4A373]/30',
  'border-yellow-500/20': 'border-[#D4A373]/30',
  'from-gray-900': 'from-[#FDFBF7]',
  'to-gray-800': 'to-[#F5F5F0]',
  'from-purple-900': 'from-[#EAE2D3]',
  'to-gray-900': 'to-[#FDFBF7]',
  'to-gray-950': 'to-[#FDFBF7]',
  'bg-gray-900/80': 'bg-white/80',
  'bg-gray-900/40': 'bg-white/40',
  'bg-gray-900/30': 'bg-[#FDFBF7]/50',
  'bg-gray-800/60': 'bg-white/60',
  'bg-gray-800/50': 'bg-white/50',
  'bg-gray-800/30': 'bg-white/30',
  'bg-gray-700/50': 'bg-[#EAE6DF]/50',
  'shadow-purple-500/20': 'shadow-[#C2A878]/20',
  'shadow-purple-900/50': 'shadow-[#C2A878]/30',
  'shadow-lg': 'shadow-sm',
  'shadow-xl': 'shadow-md',
  'shadow-2xl': 'shadow-lg',
  'ring-purple-500': 'ring-[#C2A878]'
};

for (const [oldClass, newClass] of Object.entries(replacements)) {
  code = code.split(oldClass).join(newClass);
}

// Emphasize headings with serif
code = code.replace(/<h1 className="/g, '<h1 className="font-serif ');
code = code.replace(/<h2 className="/g, '<h2 className="font-serif ');
code = code.replace(/<h3 className="/g, '<h3 className="font-serif ');

// Replace Interfaces
const oldQuestion = `export interface Question {
  id: string;
  subject: Subject;
  unit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'fill_in_the_blank';
  prompt: string; // The question text
  options?: string[]; // For multiple choice
  correctAnswer: string; // The exact answer text
  clue?: string; // Optional hint
  createdAt: number;
}`;

const newQuestion = `export interface Question {
  id: string;
  subject: Subject;
  unit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'fill_in_the_blank';
  prompt: string; // The question text
  options?: string[]; // For multiple choice
  correctAnswer: string; // The exact answer text
  clue?: string; // Optional hint
  mediaUrl?: string; // Optional multimedia URL
  mediaType?: 'image' | 'youtube' | 'audio'; // Multimedia type
  createdAt: number;
}`;
code = code.replace(oldQuestion, newQuestion);

const oldTask = `export interface Task {
  id: string;
  title: string;
  subject: Subject;
  targetUnits: number[]; // e.g. [1, 2, 3]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  mcCount?: number;
  fibCount?: number;
  maxHearts?: number;
  isActive: boolean;
  createdAt: number;
}`;

const newTask = `export interface Task {
  id: string;
  title: string;
  subject: Subject;
  targetUnits: number[]; // e.g. [1, 2, 3]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  gameMode?: 'normal' | 'survival' | 'speed';
  questionCount: number;
  mcCount?: number;
  fibCount?: number;
  maxHearts?: number;
  isActive: boolean;
  createdAt: number;
}`;
code = code.replace(oldTask, newTask);

const oldAttempt = `export interface Attempt {
  id: string;
  taskId: string;
  userId: string;
  userDisplayName: string;
  subject: Subject;
  score: number;
  accuracy: number;
  correctCount?: number;
  totalAnswered?: number;
  timeTaken: number;
  wrongQuestionIds: string[];
  answers?: AttemptAnswer[];
  timestamp: number;
}`;

const newAttempt = `export interface Attempt {
  id: string;
  taskId: string;
  userId: string;
  userDisplayName: string;
  subject: Subject;
  score: number;
  accuracy: number;
  correctCount?: number;
  totalAnswered?: number;
  timeTaken: number;
  cheatCount?: number;
  wrongQuestionIds: string[];
  answers?: AttemptAnswer[];
  timestamp: number;
}`;
code = code.replace(oldAttempt, newAttempt);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
