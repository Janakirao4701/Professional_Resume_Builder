#!/usr/bin/env python3
"""
Logic tests verifying regex patterns and prompt parameters.
"""

import json
import re
import sys
from pathlib import Path

def test_ats_prompt():
    print("[RUN] Testing ats_system_prompt.json...")
    project_root = Path(__file__).resolve().parents[2]
    prompt_path = project_root / 'resume_prompts' / 'ats_system_prompt.json'
    
    if not prompt_path.exists():
        print(f"[FAIL] Prompt file not found at {prompt_path}")
        return False
        
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if "prompt" not in data:
            print("[FAIL] JSON file is missing the 'prompt' key.")
            return False
        prompt_text = data["prompt"]
        if not prompt_text or not isinstance(prompt_text, str):
            print("[FAIL] 'prompt' value must be a non-empty string.")
            return False
        print(f"[PASS] Prompt file is valid JSON and contains {len(prompt_text)} characters.")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to read/parse prompt JSON: {e}")
        return False

def test_parse_content_regex():
    print("[RUN] Testing parseContent regex patterns...")
    # These match the JS regexes in app.js
    summary_rx = re.compile(r'(?:^|\n)\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SKILLS|TECHNICAL SKILLS|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)', re.IGNORECASE)
    skills_rx = re.compile(r'(?:^|\n)\s*\[?(?:SKILLS|TECHNICAL SKILLS)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS)\]?:?)|$)', re.IGNORECASE)
    experience_rx = re.compile(r'(?:^|\n)\s*\[?(?:EXPERIENCE|PROFESSIONAL EXPERIENCE)\]?:?\s*([\s\S]*?)(?=(?:\n\s*\[?(?:SUMMARY|PROFESSIONAL SUMMARY|SKILLS|TECHNICAL SKILLS|EDUCATION|CERTIFICATIONS)\]?:?)|$)', re.IGNORECASE)

    sample_resume = """
[PROFESSIONAL SUMMARY]
This is my summary. It has some text.

[TECHNICAL SKILLS]
- Skill A: Detailed description
- Skill B

[PROFESSIONAL EXPERIENCE]
Company | Location | Role | Dates
- Did some work.
- Improved things.
"""

    summary_match = summary_rx.search(sample_resume)
    skills_match = skills_rx.search(sample_resume)
    exp_match = experience_rx.search(sample_resume)

    if not summary_match or summary_match.group(1).strip() != "This is my summary. It has some text.":
        print("[FAIL] Summary regex match failed.")
        return False
    if not skills_match or skills_match.group(1).strip() != "- Skill A: Detailed description\n- Skill B":
        print("[FAIL] Skills regex match failed.")
        return False
    if not exp_match or exp_match.group(1).strip() != "Company | Location | Role | Dates\n- Did some work.\n- Improved things.":
        print("[FAIL] Experience regex match failed.")
        return False

    print("[PASS] Regex patterns correctly parsed sections.")
    return True

def main():
    success = True
    success &= test_ats_prompt()
    success &= test_parse_content_regex()
    
    if success:
        print("[SUCCESS] All logic tests passed successfully!")
        sys.exit(0)
    else:
        print("[FAILURE] Some logic tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main()
