const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const badBlock = `  const handleAnswer = async (answer: string) => {
    if (showingWrongAnswer) return;
    const renderMedia = (q: Question) => {
    if (!q.mediaUrl) return null;
    if (q.mediaType === 'youtube') {
      const videoId = q.mediaUrl.split('v=')[1]?.split('&')[0] || q.mediaUrl.split('/').pop();
      return <div className="mb-4 aspect-video"><iframe className="w-full h-full rounded-lg" src={\`https://www.youtube.com/embed/\${videoId}\`} frameBorder="0" allowFullScreen></iframe></div>;
    }
    if (q.mediaType === 'audio') {
      return <audio controls src={q.mediaUrl} className="w-full mb-4" />;
    }
    return <img src={q.mediaUrl} alt="media" className="w-full max-h-64 object-contain rounded-lg mb-4 bg-white/50" />;
  };

  const currentQ = questions[currentIndex];`;

const goodBlock = `  const renderMedia = (q: Question) => {
    if (!q.mediaUrl) return null;
    if (q.mediaType === 'youtube') {
      const videoId = q.mediaUrl.split('v=')[1]?.split('&')[0] || q.mediaUrl.split('/').pop();
      return <div className="mb-4 aspect-video"><iframe className="w-full h-full rounded-lg" src={\`https://www.youtube.com/embed/\${videoId}\`} frameBorder="0" allowFullScreen></iframe></div>;
    }
    if (q.mediaType === 'audio') {
      return <audio controls src={q.mediaUrl} className="w-full mb-4" />;
    }
    return <img src={q.mediaUrl} alt="media" className="w-full max-h-64 object-contain rounded-lg mb-4 bg-white/50" />;
  };

  const currentQ = questions[currentIndex];

  const handleAnswer = async (answer: string) => {
    if (showingWrongAnswer) return;`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('src/App.tsx', code);
