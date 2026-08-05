# System Architecture: Automated Resume Pipeline

## 1. System Overview
The Automated Resume Pipeline is an event-driven architecture designed to maintain a constantly updated, professional Software Engineering resume with zero manual backend coding and zero self-hosted infrastructure. It completely separates the **Data Layer** (JSON format) from the **Presentation Layer** (HTML/CSS Template) and relies entirely on **GitHub Actions** as the orchestration engine, running natively inside the GitHub ecosystem the code already lives in.

---

## 2. Core Components

### 2.1. Event Sources (Triggers)
*   **Repository Dispatch (Tracked Project Repos):** Repositories labeled with the `resume-project` topic carry a small "notifier" workflow that fires a `repository_dispatch` event to the `resume-core` repository whenever they receive a push to their default branch.
*   **GitHub Issue Form (Manual Work Experience):** A structured Issue Form (`.github/ISSUE_TEMPLATE/work-experience.yml`) inside `resume-core` replaces the standalone web form. Submitting the form opens a labeled issue, which triggers the manual-update workflow directly — no external hosting or webhook receiver required.

### 2.2. Orchestration Layer (GitHub Actions Workflow Engine)
*   Acts as the complete backend and central nervous system, defined entirely in version-controlled YAML inside `resume-core/.github/workflows/`.
*   Handles event ingestion (`repository_dispatch`, `issues`), GitHub API communications, logic routing (via job steps and `actions/github-script`), JSON data merging (via a Node.js step), and PDF rendering — all on GitHub-hosted runners.

### 2.3. AI Processing Node
*   Utilizes GitHub Models (GPT-4o-mini) or Gemini API, called via an HTTP request step (`curl` or `actions/github-script`) inside the workflow.
*   Receives raw project data and uses a predefined System Prompt to generate professional, ATS-friendly bullet points that seamlessly integrate the tech stack.
*   The AI API key is stored as an encrypted GitHub Actions Secret (`AI_API_KEY`) and never leaves the runner.

### 2.4. Storage & File System (GitHub Main Resume Repo)
*   `resume.json`: The single source of truth structured according to the JSON Resume Standard.
*   `template.html`: The visual layout utilizing Handlebars.js and CSS.
*   `resume.pdf`: The final compiled output file.

### 2.5. PDF Generation Engine
*   A Node.js script utilizing **Puppeteer** (Headless Chrome), executed directly as a workflow step on the GitHub-hosted `ubuntu-latest` runner — no external VM or Docker host required.

---

## 3. Data Flow Architecture

### Flow A: Automated Project Integration
1. **Trigger:** Developer pushes to a project repo tagged `resume-project`. Its notifier workflow sends a `repository_dispatch` event (`resume_update`) to `resume-core`, carrying the repo name and description.
2. **Fetch:** The `resume-core` workflow checks out the repo, then calls the GitHub REST API to fetch repository details and the `languages_url` endpoint to build the tech stack.
3. **AI Generation:** A workflow step sends the aggregated data to the AI API to generate professional bullet points.
4. **Data Merge:** A Node.js step reads the existing `resume.json`, appends the AI-generated object to the `projects` array, and writes it back to the runner's workspace.
5. **Render:** The workflow runs `node generate-pdf.js` to render the updated PDF.
6. **Deploy:** The workflow commits and pushes the updated `resume.json` and `resume.pdf` back to `resume-core` using the built-in `GITHUB_TOKEN`.

### Flow B: Manual Work Experience Integration
1. **Input:** User fills out the GitHub Issue Form for new Work Experience (Company, Position, Start Date, End Date, Rough Description).
2. **Trigger:** Submitting the form opens a labeled (`work-experience`) issue in `resume-core`, which fires the `issues: opened` event.
3. **Process:** The workflow parses the issue body, formats the input via the AI step, updates the `work` array in `resume.json`, then runs the exact same PDF generation and commit steps as Flow A, and closes the issue.

---

## 4. Submodule Handling Architecture
To prevent monorepos from appearing as multiple separate projects:
*   **Identification:** A workflow step checks whether the triggering repository contains a `.gitmodules` file via the GitHub Contents API.
*   **Aggregation:** If found, the workflow iterates through the referenced submodules, fetches each one's languages, and bundles all technologies into a single prompt for the AI, ensuring the entire architecture is represented as one cohesive project on the resume.

---

## 5. System Visualization

[ Tracked Repo Push ]         [ GitHub Issue Form ]
 (resume-project topic)        (New Work Exp)
       │                             │
       ▼                             ▼
[ repository_dispatch event ]  [ issues: opened event ]
       │                             │
       ╰──────────────┬──────────────╯
                      │
            [ GitHub Actions Workflow ]
                      │
                      ├─► 🧠 AI Step (Formats Data / Bullet Points)
                      │
                      ├─► 📝 JSON Merge (Updates resume.json)
                      │
                      ├─► 🖨️ PDF Engine (Puppeteer renders HTML + JSON)
                      │
                      ▼
            [ Main Resume Repo ]
      (Commits new resume.json & resume.pdf via GITHUB_TOKEN)
