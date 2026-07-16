const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `              </>
            )}
          </div>
        ))}
        {questions.length === 0`;

const replacement = `              </>
            )}
            </div>
          </div>
        ))}
        {questions.length === 0`;

if(code.includes(target)) {
    fs.writeFileSync('src/App.tsx', code.replace(target, replacement));
    console.log('Success');
} else {
    console.log('Not found');
}
