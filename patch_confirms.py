import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Import
if "import { confirmModal }" not in content:
    content = "import { confirmModal } from './confirm';\\n" + content

# handleDelete
content = content.replace("    // confirm removed\\n    try {\\n      await deleteDoc(doc(db, 'questions', id));", 
                          "    if (!(await confirmModal('確定刪除？'))) return;\\n    try {\\n      await deleteDoc(doc(db, 'questions', id));")

# handleBulkDelete
content = content.replace("    if (selectedQuestions.length === 0) return;\\n    // confirm removed\\n    try {", 
                          "    if (selectedQuestions.length === 0) return;\\n    if (!(await confirmModal(`確定刪除 ${selectedQuestions.length} 題？`))) return;\\n    try {")

# handleDeleteAttempts
content = content.replace("    if (ids.length === 0) return;\\n    // confirm removed\\n    setDeleting(true);", 
                          "    if (ids.length === 0) return;\\n    if (!(await confirmModal(`確定要刪除 ${ids.length} 筆紀錄嗎？此動作無法復原。`))) return;\\n    setDeleting(true);")

with open("src/App.tsx", "w") as f:
    f.write(content)

