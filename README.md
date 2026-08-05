# DevResume Automation Pipeline

An event-driven architecture that keeps a Software Engineering resume
continuously up to date with **zero manual backend coding** and **zero
self-hosted infrastructure** — orchestrated entirely by GitHub Actions.

This is the main/parent project: it holds the architecture, implementation,
and design documentation, plus the [`resume-core`](https://github.com/ChamathDilshanC/resume-core)
repository as a git submodule (the actual resume data, template, PDF
generator, and workflows live there).

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
```
