const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("role: 'admin' | 'player';", "role: 'admin' | 'player';\n  points?: number;\n  badges?: string[];\n  lastPlayedAt?: number;");

const proceedToNext = `      try {
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
          cheatCount,
          wrongQuestionIds: currentWrongIds,
          answers: currentAnswers,
          timestamp: Date.now()
        } as Omit<Attempt, 'id'>);

        // Update User points and badges
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const newPoints = (userData.points || 0) + currentScore;
          const badges = new Set<string>(userData.badges || []);
          if (accuracy === 100 && totalQuestions >= 5) badges.add('perfect_100');
          if (task!.gameMode === 'speed') badges.add('speed_demon');
          if (task!.gameMode === 'survival' && totalQuestions >= 15) badges.add('survival_expert');
          if (cheatCount === 0 && totalQuestions >= 5) badges.add('honest_player');
          
          await updateDoc(userRef, {
            points: newPoints,
            badges: Array.from(badges),
            lastPlayedAt: Date.now()
          });
        }`;

code = code.replace(/      try {\n        const attemptRef = await addDoc\(collection\(db, 'attempts'\), \{[\s\S]*?\} as Omit<Attempt, 'id'>\);/m, proceedToNext);

fs.writeFileSync('src/App.tsx', code);
