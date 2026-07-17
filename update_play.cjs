const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldState = `const [showingWrongAnswer, setShowingWrongAnswer] = useState(false);
  
  const [inputVal, setInputVal] = useState('');`;

const newState = `const [showingWrongAnswer, setShowingWrongAnswer] = useState(false);
  
  const [inputVal, setInputVal] = useState('');
  
  const [attemptAnswers, setAttemptAnswers] = useState<AttemptAnswer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);`;

code = code.replace(oldState, newState);

const oldProceed = `const proceedToNext = async (currentScore: number, isCorrect: boolean, currentLives: number, currentWrongIds: string[]) => {
    if (currentLives <= 0 || currentIndex + 1 >= questions.length) {
      // Game over
      const timeTaken = Date.now() - startTime;
      const totalQuestions = currentIndex + 1;
      const correctAnswers = totalQuestions - currentWrongIds.length;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      
      try {
        const attemptRef = await addDoc(collection(db, 'attempts'), {
          taskId: task!.id,
          userId: user.uid,
          userDisplayName: user.displayName,
          subject: task!.subject,
          score: currentScore,
          accuracy,
          correctCount: correctAnswers,
          totalAnswered: totalQuestions,
          timeTaken,
          wrongQuestionIds: currentWrongIds,
          timestamp: Date.now()
        } as Omit<Attempt, 'id'>);`;

const newProceed = `const proceedToNext = async (currentScore: number, isCorrect: boolean, currentLives: number, currentWrongIds: string[], currentAnswers: AttemptAnswer[]) => {
    if (currentLives <= 0 || currentIndex + 1 >= questions.length) {
      // Game over
      const timeTaken = Date.now() - startTime;
      const totalQuestions = currentIndex + 1;
      const correctAnswers = totalQuestions - currentWrongIds.length;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      
      try {
        const attemptRef = await addDoc(collection(db, 'attempts'), {
          taskId: task!.id,
          userId: user.uid,
          userDisplayName: user.displayName,
          subject: task!.subject,
          score: currentScore,
          accuracy,
          correctCount: correctAnswers,
          totalAnswered: totalQuestions,
          timeTaken,
          wrongQuestionIds: currentWrongIds,
          answers: currentAnswers,
          timestamp: Date.now()
        } as Omit<Attempt, 'id'>);`;

code = code.replace(oldProceed, newProceed);

const oldHandle = `const handleAnswer = async (answer: string) => {
    if (showingWrongAnswer) return;
    const currentQ = questions[currentIndex];
    
    // Check if the correct answer is Chinese
    const isChinese = /[\\u4E00-\\u9FFF]/.test(currentQ.correctAnswer);
    let isCorrect = false;
    if (isChinese && currentQ.type === 'fill_in_the_blank') {
        const ansPinyin = pinyin(answer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        const correctPinyin = pinyin(currentQ.correctAnswer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        isCorrect = (ansPinyin === correctPinyin) && answer.trim().length > 0;
    } else {
        isCorrect = answer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();
    }
    
    let currentScore = score;
    let currentCombo = combo;
    let currentEnergy = energy;
    
    if (isCorrect) {`;

const newHandle = `const handleAnswer = async (answer: string) => {
    if (showingWrongAnswer) return;
    const currentQ = questions[currentIndex];
    
    // Check if the correct answer is Chinese
    const isChinese = /[\\u4E00-\\u9FFF]/.test(currentQ.correctAnswer);
    let isCorrect = false;
    if (isChinese && currentQ.type === 'fill_in_the_blank') {
        const ansPinyin = pinyin(answer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        const correctPinyin = pinyin(currentQ.correctAnswer.trim(), { toneType: 'none', v: true }).replace(/\\s+/g, '').toLowerCase();
        isCorrect = (ansPinyin === correctPinyin) && answer.trim().length > 0;
    } else {
        isCorrect = answer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();
    }
    
    const timeTakenForQuestion = Date.now() - questionStartTime;
    const newAnswer: AttemptAnswer = {
      questionId: currentQ.id,
      questionPrompt: currentQ.prompt,
      userAnswer: answer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      timeTaken: timeTakenForQuestion
    };
    const newAnswers = [...attemptAnswers, newAnswer];
    setAttemptAnswers(newAnswers);

    let currentScore = score;
    let currentCombo = combo;
    let currentEnergy = energy;
    
    if (isCorrect) {`;

code = code.replace(oldHandle, newHandle);

const oldCorrectProceed = `      setInputVal('');
      
      proceedToNext(currentScore, true, lives, wrongQuestionIds);
    } else {`;

const newCorrectProceed = `      setInputVal('');
      
      proceedToNext(currentScore, true, lives, wrongQuestionIds, newAnswers);
    } else {`;

code = code.replace(oldCorrectProceed, newCorrectProceed);

const oldWrongProceed = `      setShowingWrongAnswer(true);
      setTimeout(() => {
        setShowingWrongAnswer(false);
        proceedToNext(currentScore, false, newLives, newWrongIds);
      }, 2000);
    }`;

const newWrongProceed = `      setShowingWrongAnswer(true);
      setTimeout(() => {
        setShowingWrongAnswer(false);
        proceedToNext(currentScore, false, newLives, newWrongIds, newAnswers);
      }, 2000);
    }`;

code = code.replace(oldWrongProceed, newWrongProceed);

fs.writeFileSync('src/App.tsx', code);
console.log('done updating play');
