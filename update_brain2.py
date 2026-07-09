import os

changelog_path = r"C:\Users\satya\Videos\company\consilio\.brain\CHANGELOG.md"
with open(changelog_path, 'r', encoding='utf-8') as f:
    content = f.read()

changelog_add = """## 2026-06-27 — direct-pdf-download — pending
direct-pdf-download — Resume Lab + Cheat Sheet download a real text PDF directly via @react-pdf/renderer (no print dialog / headers)
touches: package.json, next.config.js, components/resume/resume-pdf.tsx, components/resume/resume-editor.tsx, components/cheat-sheet/cheat-sheet-pdf.tsx, components/cheat-sheet/cheat-sheet-client.tsx
breaking: no   affects: Resume Lab, Cheat Sheet

"""

# Find the exact horizontal rule "---" and insert after it
parts = content.split('\n---\n\n')
if len(parts) >= 2:
    parts[1] = changelog_add + parts[1]
    new_content = '\n---\n\n'.join(parts)
    with open(changelog_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("CHANGELOG updated")
else:
    print("Could not find separator")
