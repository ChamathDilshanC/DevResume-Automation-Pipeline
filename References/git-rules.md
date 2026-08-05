# Git & Development Workflow Rules

This document defines the strict version control and development guidelines the AI Agent (e.g., Claude Code) MUST follow while generating, committing, and pushing code for this repository.

## 1. Strict Author Identity (No AI Footprints)
*   **Rule:** The ONLY authorized author for all commits, files, and documentation is **Chamath Dilshan** (GitHub: **ChamathDilshanC**).
*   **Action:** Before making any commits, you MUST ensure the local Git configuration is set exactly to the following:
    ```bash
    git config user.name "Chamath Dilshan"
    git config user.email "chamathdilshan.dev@gmail.com"
    ```
*   **Constraint:** DO NOT include "Claude", "AI", "Anthropic", "Co-authored-by", or any indication of AI generation in the commit history, commit descriptions, source code comments, or author metadata. The repository must appear 100% human-authored by ChamathDilshanC.

## 2. Commit Frequency & Granularity (Atomic Commits)
*   **Rule:** Do not lump all code into a single massive commit at the end of the project.
*   **Action:** Make atomic, incremental commits immediately after finishing a specific, logical part or module of the project.
*   **Required Commit Milestones (Examples):**
    *   Commit 1: After creating the initial file structure and `package.json`.
    *   Commit 2: After completing the `sample-resume.json` data structure.
    *   Commit 3: After completing the Handlebars HTML template (`template.html`) and CSS.
    *   Commit 4: After successfully writing and testing the Puppeteer PDF generation script (`generate-pdf.js`).

## 3. Commit Message Standards
*   **Rule:** Use conventional commit messages. Keep them professional, concise, and descriptive.
*   **Format:** `type(scope): description`
*   **Examples:**
    *   `feat: initialize JSON resume structure`
    *   `style: create responsive CSS for PDF print`
    *   `feat: implement Puppeteer PDF rendering logic`
    *   `fix: resolve Handlebars data binding issue in projects section`

## 4. Pushing Code
*   **Rule:** Push the code to the remote repository only after a fully working, tested feature/module is completed and properly committed locally following the rules above.
