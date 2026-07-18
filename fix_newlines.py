import re
with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("toast(`錯誤：題數大於圖庫中符合條件的題數。\\\\n選擇題:", "toast(`錯誤：題數大於圖庫中符合條件的題數。\\n選擇題:")

with open("src/App.tsx", "w") as f:
    f.write(content)
