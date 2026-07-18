const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix the hidden div injection
code = code.replace(/<div className="hidden">\s*<\/div>/g, '');

const badCode = `<div className="hidden">
      </div>`;
code = code.replace(badCode, '');

fs.writeFileSync('src/App.tsx', code);
