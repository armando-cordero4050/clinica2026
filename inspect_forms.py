
import re

file_path = r'D:\DentalFlow\docs\formularios.md'

keywords = [
    "Nota evolución breve",
    "Anam. Odontopediatría", 
    "Endodoncia", 
    "Signos Vitales", 
    "Consentimientos"
]

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for keyword in keywords:
        print(f"--- Searching for: {keyword} ---")
        start_index = content.find(keyword)
        if start_index != -1:
            # Print 500 chars before and 2000 chars after
            start = max(0, start_index - 500)
            end = min(len(content), start_index + 2000)
            snippet = content[start:end]
            print(f"Found at index {start_index}. Snippet similar to HTML structure:")
            print(snippet.replace('><', '>\n<')) # formatting for readability
        else:
            print("Not found.")
        print("\n")

except Exception as e:
    print(f"Error: {e}")
