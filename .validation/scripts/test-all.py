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

    print("[RUN] Running All Verification Checks...")
    print("-" * 50)

    try:
        # Run the layout verification script
        result = subprocess.run(
            [sys.executable, str(verify_script)],
            capture_output=True,
            text=True,
            check=False
        )

        print(result.stdout)
        if result.stderr:
            print("Errors:")
            print(result.stderr)

        sys.exit(result.returncode)

    except Exception as e:
        print(f"[ERROR] Failed to execute validation scripts: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
