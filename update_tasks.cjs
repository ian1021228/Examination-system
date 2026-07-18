const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldInterface = `export interface Task {
  id: string;
  title: string;
  subject: Subject;
  targetUnits: number[]; // e.g. [1, 2, 3]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  maxHearts?: number;
  isActive: boolean;
  createdAt: number;
}`;

const newInterface = `export interface Task {
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
code = code.replace(oldInterface, newInterface);
fs.writeFileSync('src/App.tsx', code);
