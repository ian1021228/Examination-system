import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Update types
target_new_type = "const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');"
replacement_new_type = "const [newType, setNewType] = useState<'multiple_choice'|'fill_in_the_blank'|'question_group'>('multiple_choice');\\n  const [newSubQuestions, setNewSubQuestions] = useState<SubQuestion[]>([]);"
content = content.replace(target_new_type, replacement_new_type)

target_edit_type = "const [editType, setEditType] = useState<'multiple_choice'|'fill_in_the_blank'>('multiple_choice');"
replacement_edit_type = "const [editType, setEditType] = useState<'multiple_choice'|'fill_in_the_blank'|'question_group'>('multiple_choice');\\n  const [editSubQuestions, setEditSubQuestions] = useState<SubQuestion[]>([]);"
content = content.replace(target_edit_type, replacement_edit_type)

with open("src/App.tsx", "w") as f:
    f.write(content)
