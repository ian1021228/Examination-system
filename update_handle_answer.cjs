const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldHandle = `    } else {
        isCorrect = answer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();
    }
    
    let currentScore = score;
    let currentCombo = combo;
    let currentEnergy = energy;`;

const newHandle = `    } else {
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
    let currentEnergy = energy;`;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('src/App.tsx', code);
