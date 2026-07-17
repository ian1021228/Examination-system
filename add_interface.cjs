const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const attemptAnswerInterface = `export interface AttemptAnswer {
  questionId: string;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
}

export interface Attempt {`;

code = code.replace('export interface Attempt {', attemptAnswerInterface);

const attemptUpdate = `  wrongQuestionIds: string[];
  answers?: AttemptAnswer[];
  timestamp: number;`;

code = code.replace('  wrongQuestionIds: string[];\n  timestamp: number;', attemptUpdate);

fs.writeFileSync('src/App.tsx', code);
console.log('done');
