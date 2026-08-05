# Technologies Used: Automated Resume Pipeline

This document details the technology stack powering the Automated Resume Pipeline, utilizing a completely serverless/no-backend-code, no-self-hosted-infrastructure approach.

---

## 1. Workflow Automation & Orchestration

### **GitHub Actions**
*   **What it is:** GitHub's native CI/CD and workflow automation engine, defined in version-controlled YAML.
*   **Why we use it:** It eliminates the need to write, host, or maintain a custom backend or separate automation server. It natively handles event triggers (`repository_dispatch`, `issues`), secrets management, and API requests, and runs entirely on free, ephemeral, GitHub-hosted compute — with the workflow definitions living right next to the code they operate on.
*   **How it is used:** Acts as the complete backend engine. It catches `repository_dispatch` events from tracked repos and GitHub Issue Form submissions, triggers API calls to LLMs, runs JavaScript steps to merge JSON data, and orchestrates the final PDF generation and Git commits — all within a single workflow run.

---

## 2. Artificial Intelligence

### **GitHub Models / Google Gemini API**
*   **What it is:** Advanced Large Language Models (LLMs) accessed via REST API.
*   **Why we use it:** To transform raw repository data (like README files and language statistics) into polished, professional resume bullet points without manual writing.
*   **How it is used:** Called directly from a GitHub Actions workflow step via `curl` or `actions/github-script`, using an encrypted repository secret (`AI_API_KEY`) to dynamically format text before it is saved to the JSON database.

---

## 3. Data Standard & Templating

### **JSON Resume Schema (`resume.json`)**
*   **What it is:** An open-source standard for structuring resume data in JSON format.
*   **Why we use it:** It completely decouples the resume's data from its visual design, making data injection highly reliable.

### **Handlebars.js / HTML & CSS**
*   **What it is:** A logic-less templating engine.
*   **Why we use it:** Allows dynamic injection of the updated JSON data into a beautiful static HTML layout using simple `{{variable}}` syntax.

---

## 4. Document Generation

### **Node.js & Puppeteer**
*   **What it is:** A library providing a high-level API to control headless Chrome.
*   **Why we use it:** To ensure pixel-perfect HTML-to-PDF conversion.
*   **How it is used:** A small local script (`generate-pdf.js`) is run directly as a step inside the GitHub Actions workflow, on the `ubuntu-latest` runner. It compiles the Handlebars template with the latest JSON and exports the final PDF.

---

## 5. Version Control, Webhooks & Forms

### **GitHub REST API, `repository_dispatch` & Issue Forms**
*   **What it is:** GitHub's native event broadcasting and structured-input systems.
*   **Why we use it:** To ensure the resume stays up-to-date in near real-time as development happens, and to collect manual updates without hosting a separate form or webhook receiver.
*   **How it is used:** Tracked repositories fire a `repository_dispatch` event to `resume-core` when pushed to. A GitHub Issue Form collects manual Work Experience entries and triggers the workflow via the `issues: opened` event. The workflow then uses the REST API and `GITHUB_TOKEN` to commit the generated files back to the repository.

---

## 6. Infrastructure & Hosting

### **GitHub-Hosted Runners (`ubuntu-latest`)**
*   **What it is:** Ephemeral, GitHub-managed virtual machines that execute each Actions workflow run.
*   **Why we use it:** Free (2,000+ minutes/month on private repos, unlimited on public repos), zero maintenance, and pre-provisioned with Node.js, Git, and Chrome dependencies — removing the need for a self-hosted VM, Docker host, or 24/7 uptime management entirely.
*   **How it is used:** Every workflow run — fetching repo data, calling the AI API, merging JSON, rendering the PDF with Puppeteer, and committing the result — happens on a fresh runner instance that is discarded once the job completes.
