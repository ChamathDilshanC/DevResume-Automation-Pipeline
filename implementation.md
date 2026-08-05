# Implementation Guide: Automated Resume Pipeline

This document outlines the step-by-step implementation phases for building the Automated Resume Pipeline, using GitHub Actions for both the automated project flow and the manual work-experience flow — no external orchestration server required.

---

## Phase 1: Repository & Data Foundation

**1. Create the Main Resume Repository**
*   Create a private repository (e.g., `resume-core`).
*   Initialize the following file structure:
    *   `resume.json`: The base data file following the JSON Resume standard.
    *   `template.html`: The HTML structure using Handlebars.js syntax for data binding.
    *   `styles.css`: The stylesheet for the resume.
    *   `generate-pdf.js`: The Node.js script utilizing Puppeteer to merge `resume.json` with `template.html` and print the PDF.
    *   `package.json`: Contains dependencies (`puppeteer`, `handlebars`, `fs-extra`).
    *   `.github/workflows/`: Holds the GitHub Actions workflow YAML files (Phase 3 & 4).
    *   `.github/ISSUE_TEMPLATE/work-experience.yml`: The structured Issue Form used for manual updates (Phase 4).

**2. Configure the Node.js PDF Generator**
*   Write the logic in `generate-pdf.js` to:
    1. Read `resume.json`.
    2. Read `template.html`.
    3. Compile the template using Handlebars: `const template = Handlebars.compile(html); const result = template(jsonData);`
    4. Launch Puppeteer (with `--no-sandbox` args, required on GitHub-hosted runners), load the compiled HTML, and export it as `resume.pdf`.

---

## Phase 2: GitHub Actions & API Setup

**1. Enable GitHub Actions on `resume-core`**
*   No external host, Docker container, or VM is required — GitHub provides free, ephemeral `ubuntu-latest` runners with Node.js installable via `actions/setup-node`.
*   Confirm the repository's **Settings → Actions → General → Workflow permissions** is set to "Read and write permissions" so workflows can commit back using the default `GITHUB_TOKEN`.

**2. Generate Necessary API Keys & Secrets**
*   **AI API Key:** Obtain an API key from GitHub Models (GPT-4o-mini) or Google AI Studio (Gemini). Store it as an encrypted repository secret in `resume-core`: `AI_API_KEY`.
*   **Cross-Repo Dispatch PAT:** Generate a fine-grained Personal Access Token scoped to trigger `repository_dispatch` on `resume-core`. Store it as a secret named `RESUME_CORE_PAT` in each tracked project repo (or as an Organization secret if all repos share one owner).

---

## Phase 3: Building the Automated Workflow (GitHub Actions)

**1. Notifier Workflow (in each tracked project repo)**
*   Add `.github/workflows/notify-resume.yml`, triggered `on: push` to the default branch.
*   Its only job: call the GitHub API to send a `repository_dispatch` event (type `resume_update`) to `resume-core`, using the `RESUME_CORE_PAT` secret — e.g. via `peter-evans/repository-dispatch@v3` or a `curl` step against `POST /repos/{owner}/resume-core/dispatches`.

**2. Main Update Workflow (in `resume-core`)**
Create `.github/workflows/update-resume.yml`, triggered `on: repository_dispatch: types: [resume_update]`, with the following sequential steps:

**Step 1 — Checkout & Setup**
*   `actions/checkout@v4` and `actions/setup-node@v4`.

**Step 2 — GitHub API Fetch Node (Data Gathering)**
*   Call the REST API for the source repo's Name, Description, and `languages_url` endpoint to get the tech stack.
*   *Submodule Check:* Check if a `.gitmodules` file exists via the Contents API. If true, iterate through submodules and append their languages to the main tech stack list.

**Step 3 — AI Generation (HTTP Request Step)**
*   Send the aggregated data to the AI API using the `AI_API_KEY` secret.
*   **Prompt Instruction:** *"Write 2 professional resume bullet points for a project named {Repo_Name}. Description: {Description}. You MUST seamlessly integrate these technologies: {Tech_Stack} into the sentences. Do not create a separate skills list."*

**Step 4 — JSON Manipulation (Node.js Script Step)**
*   Fetch the current `resume.json` from the main repository.
*   Parse the JSON and append the AI-generated object to the `projects` array.

**Step 5 — PDF Generation (Run Script Step)**
*   Run the `node generate-pdf.js` script to generate the updated `resume.pdf`.

**Step 6 — Commit & Push Step**
*   Commit and push the new `resume.json` and `resume.pdf` back to the `resume-core` repository, authenticated with the default `GITHUB_TOKEN` (e.g. via `git commit`/`git push` or `stefanzweifel/git-auto-commit-action@v5`).

---

## Phase 4: Building the Manual Update Flow (GitHub Actions + Issue Form)

**1. GitHub Issue Form (Frontend)**
*   Add `.github/ISSUE_TEMPLATE/work-experience.yml` to `resume-core` with structured fields to capture Work Experience details: `Company`, `Position`, `Start Date`, `End Date`, and `Rough Description`.
*   Apply a fixed label (e.g. `work-experience`) automatically via the template so the workflow can filter for it — submitting the form simply opens a GitHub issue, with no separate frontend to host or webhook URL to wire up.

**2. Manual Update Workflow Integration**
*   Create `.github/workflows/update-work-experience.yml`, triggered `on: issues: types: [opened]`, gated with `if: contains(github.event.issue.labels.*.name, 'work-experience')`.
*   Parse the issue body into fields (e.g. with `actions/github-script` or `stefanbuck/github-issue-parser@v3`) and route the data into the AI Processing step.
*   **Prompt Instruction:** *"Format this rough work experience description into 2-3 professional resume bullet points."*
*   Update the `work` array in the `resume.json` instead of the `projects` array.
*   Trigger the exact same PDF Generation (Step 5) and Commit & Push (Step 6) steps from Phase 3 to finalize the process, then close the issue via the API.

---

## Phase 5: Testing & Quality Assurance

1.  **Test the Auto Flow:** Create a dummy repository, add the `resume-project` topic and the notifier workflow, commit some code, and verify that the `update-resume.yml` run in `resume-core` completes and the repo updates with a new PDF within 1-2 minutes.
2.  **Test the Submodule Logic:** Push a monorepo structure with a `.gitmodules` file and ensure the workflow's submodule step accurately identifies the full stack before calling the AI.
3.  **Test the Manual Flow:** Submit a test entry via the GitHub Issue Form and verify the `update-work-experience.yml` run appends it correctly to the `work` section of the generated PDF without breaking the template styling.
4.  **Verify Permissions:** Confirm `GITHUB_TOKEN` has write access (Phase 2) and that `RESUME_CORE_PAT` / `AI_API_KEY` secrets are scoped correctly — a common failure point when moving off a self-hosted orchestrator.
