const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const brokenAdminDash = `          </div>
        ))}
      </div>
      </div>
      ) : (
        <MistakesTab user={user} />
      )}
    </div>
  );
}`;

const fixedAdminDash = `          </div>
        ))}
      </div>
    </div>
  );
}`;

code = code.replace(brokenAdminDash, fixedAdminDash);
fs.writeFileSync('src/App.tsx', code);
