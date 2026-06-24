#!/usr/bin/env python3
"""
Test runner executing all layout and verification scripts.
"""

import subprocess
import sys
from pathlib import Path

def main():
    scripts_dir = Path(__file__).resolve().parent
    verify_script = scripts_dir / "verify-layout.py"
    logic_script = scripts_dir / "test_logic.py"

    print("[RUN] Running All Verification Checks...")
    print("-" * 50)

    success = True

    try:
        # 1. Run layout verification
        print("[RUN] Running Layout Verification...")
        result_layout = subprocess.run(
            [sys.executable, str(verify_script)],
            capture_output=True,
            text=True,
            check=False
        )
        print(result_layout.stdout)
        if result_layout.stderr:
            print("Errors:")
            print(result_layout.stderr)
        
        if result_layout.returncode != 0:
            success = False

        # 2. Run logic tests
        print("[RUN] Running Logic & Prompt Tests...")
        result_logic = subprocess.run(
            [sys.executable, str(logic_script)],
            capture_output=True,
            text=True,
            check=False
        )
        print(result_logic.stdout)
        if result_logic.stderr:
            print("Errors:")
            print(result_logic.stderr)

        if result_logic.returncode != 0:
            success = False

        if success:
            print("[PASS] All verification checks completed successfully.")
            sys.exit(0)
        else:
            print("[FAIL] Some verification checks failed.")
            sys.exit(1)

    except Exception as e:
        print(f"[ERROR] Failed to execute validation scripts: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
