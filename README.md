# DevResume Automation Pipeline

An event-driven architecture that keeps a Software Engineering resume
continuously up to date with **zero manual backend coding** and **zero
self-hosted infrastructure** — orchestrated entirely by GitHub Actions.

This is the main/parent project: it holds the architecture, implementation,
and design documentation, plus two git submodules —
[`resume-core`](https://github.com/ChamathDilshanC/resume-core) (the resume
data, template, PDF generator, and workflows) and
[`resume-admin`](https://github.com/ChamathDilshanC/resume-admin) (a private,
single-user web editor for `resume.json`).

## Documentation

- [`architecture.md`](architecture.md) — system architecture and data flow
- [`implementation.md`](implementation.md) — phase-by-phase build guide
- [`technologies-used.md`](technologies-used.md) — technology stack rationale
- [`References/`](References/) — design/CSS guidelines, git workflow rules,
  AI prompt specs, and sample resume data used to build `resume-core`

## The `resume-core` submodule

`resume-core` is the private repository that actually runs the pipeline:
`resume.json`, the Handlebars `template.html` / `styles.css`, the Puppeteer
`generate-pdf.js` renderer, the Node.js helper scripts, and the GitHub
Actions workflows for both the automated project-push flow and the manual
work-experience Issue Form flow. See its own README for setup instructions.

## The `resume-admin` submodule

`resume-admin` is a Next.js app that gives a full CRUD UI over every section
of `resume.json` (work, projects, skills, education, certificates,
references). Sign-in is restricted to a single GitHub account via OAuth;
saving commits straight to `resume-core` and triggers PDF regeneration. See
its own README for GitHub OAuth App setup and deployment steps.

### Cloning with the submodule

```bash
git clone --recurse-submodules https://github.com/ChamathDilshanC/DevResume-Automation-Pipeline.git
```

If already cloned without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

### Pulling in updates from resume-core

Since the pipeline commits new `resume.json` / `resume.pdf` versions directly
to `resume-core`, refresh the submodule pointer here periodically:

```bash
git submodule update --remote resume-core
git add resume-core
git commit -m "chore: bump resume-core submodule reference"
```

## Project structure

```
DevResume Automation Pipeline/
  architecture.md
  implementation.md
  technologies-used.md
  References/
    design-guidelines.md
    git-rules.md
    prompts.md
    sample-resume.json
  resume-core/            <- git submodule (separate repository)
  resume-admin/           <- git submodule (separate repository)
```
