#!/usr/bin/env python3
"""
Layout verification script for Resume Builder Candidates Portal.
Scans source files for layout, positioning, and mobile-view anti-patterns.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple, Dict, Any

# Core Layout Rules to Enforce
RULES: Dict[str, Dict[str, Any]] = {
    'no-negative-text-indent': {
        'pattern': r'text-indent:\s*-\d+',
        'message': 'Negative text-indent detected. This clips bullets outside borders. Use Flexbox layout patterns instead.',
        'reference': '.kiro/patterns/css-layouts.md#1-list-bullet-items-hanging-indent'
    },
    'no-absolute-positioning-dates': {
        'pattern': r'position:\s*absolute;.*?left:\s*(?:[3-9]\d{2}|\d{4,})(?:px|pt)',
        'message': 'Absolute positioning with large left offsets used on dates. This breaks alignments on zoom. Use flexbox space-between.',
        'reference': '.kiro/patterns/css-layouts.md#2-right-aligned-dates--role-layouts'
    },
    'no-hidden-panels': {
        'pattern': r'\.app-workspace\.view-(?:edit|preview)\s+#(?:editor|preview)-panel\s*\{\s*display:\s*none',
        'message': 'Hidden editor/preview panel override detected in CSS. Workspace panels must remain visible and stack vertically.',
        'reference': '.kiro/patterns/css-layouts.md#3-responsive-panel-layout-stacked-viewport'
    },
    'no-mobile-tab-markup': {
        'pattern': r'(?:class=["\'].*mobile-tabs-container.*["\']|id=["\']menu-toggle-btn["\'])',
        'message': 'Obsolete mobile tab containers or menu toggle buttons found in HTML. These layouts must remain removed.',
        'reference': '.kiro/architecture.md#3-desktop-split-view--mobile-vertical-stack'
    },
    'no-mobile-tab-handlers': {
        'pattern': r'function\s+(?:switchMobileTab|toggleActionMenu)\s*\(',
        'message': 'Redundant mobile tab toggle or menu popup functions found in Javascript. These handlers must remain removed.',
        'reference': '.kiro/architecture.md#3-desktop-split-view--mobile-vertical-stack'
    },
    'require-aria-labels-for-inputs': {
        'pattern': r'<(?:select|textarea)(?![^>]*\baria-label\b)[^>]*>',
        'message': 'Select or Textarea element found without an aria-label. Inputs must have descriptive aria-labels for screen reader accessibility.',
        'reference': '.kiro/architecture.md#4-validation'
    }
}

def scan_file(filepath: Path) -> List[Tuple[str, int, str, str, str]]:
    """Scan a single file for rule violations."""
    violations = []
    if not filepath.exists():
        return violations

    try:
        content = filepath.read_text(encoding='utf-8')

        for rule_name, rule in RULES.items():
            pattern = re.compile(rule['pattern'], re.DOTALL | re.IGNORECASE)
            for match in pattern.finditer(content):
                # Count newlines up to the start of the match to get the correct 1-indexed line number
                line_idx = content[:match.start()].count('\n') + 1
                violations.append((
                    str(filepath.name),
                    line_idx,
                    rule_name,
                    rule['message'],
                    rule['reference']
                ))
    except Exception as e:
          print(f"[ERROR] Error reading {filepath.name}: {e}")

    return violations

def main():
    print("[INFO] Layout & Architecture Verification")
    print("=" * 60)

    project_root = Path(__file__).resolve().parents[2]
    files_to_check = {
        'style.css': project_root / 'style.css',
        'index.html': project_root / 'index.html',
        'app.js': project_root / 'app.js'
    }

    issues_found = 0
    all_violations = []

    for name, filepath in files_to_check.items():
        if not filepath.exists():
            print(f"[WARN] Expected file {name} not found at {filepath}")
            continue
            
        print(f"Checking: {name}...")
        violations = scan_file(filepath)
        if violations:
            all_violations.extend(violations)
            issues_found += len(violations)

    print()
    print("=" * 60)
    
    if issues_found == 0:
        print("[PASS] Verification Successful! All layout checks passed.")
        print("[INFO] No architectural anti-patterns found.")
        sys.exit(0)
    else:
        print(f"[FAIL] Verification Failed: Found {issues_found} violation(s)!")
        print()
        for filename, line, rule, msg, ref in all_violations:
            print(f"  [{filename}:{line}] Rule: {rule}")
            print(f"  Violation: {msg}")
            print(f"  Reference: {ref}")
            print("-" * 50)
        sys.exit(1)

if __name__ == '__main__':
    main()
