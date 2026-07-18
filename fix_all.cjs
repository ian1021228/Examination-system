const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const badEnd = `      </div>
      ) : (
        <MistakesTab user={user} />
      )}
    </div>
  );
}`;

const goodEnd = `    </div>
  );
}`;

// split and join to replace all, but then we will re-add it to TaskSelect manually
code = code.split(badEnd).join(goodEnd);

// Actually, in TaskSelect, we want:
// {activeTab === 'tasks' ? (
//    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//    ...
//    </div>
// ) : (
//    <MistakesTab user={user} />
// )}

fs.writeFileSync('src/App.tsx', code);
