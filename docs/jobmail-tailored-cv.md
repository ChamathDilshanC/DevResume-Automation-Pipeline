# JobMail tailored CV integration

## Purpose

JobMail's Send Email page already collects the target company and role. When
DevResume is connected, the user can click **Generate DevResume CV** and attach
a role-specific PDF to that application. The existing email send, schedule,
and history flows remain unchanged after the attachment is created.

## Cross-repository flow

```text
JobMail browser
  -> authenticated JobMail API
  -> resume-admin /api/integrations/jobmail/resume/generate
  -> resume-core generate-jobmail-resume.yml
  -> private resume-data checkout + in-memory overlay
  -> Puppeteer PDF + one-day artifact
  -> resume-admin artifact validation/download
  -> JobMail polling + attachment
```

The request is correlated with an opaque UUID. The role, company, and job
description are bounded and passed as workflow inputs. The overlay changes only
the generated copy (`basics.label`, `basics.targetCompany`, and
`basics.jobDescription`); it never commits back to `resume-data` or replaces
the canonical Google Drive PDF.

## Repository responsibilities

| Repository | Responsibility | Documentation |
| --- | --- | --- |
| JobMail | UI button, live progress slider, Google bearer ownership checks, attachment | [tailored-CV flow](https://github.com/ChamathDilshanC/Job_Email_Generator---Sender-Gmail-Outlook/blob/main/docs/devresume-tailored-cv.md) |
| resume-admin | Secret-protected bridge, workflow dispatch/polling, artifact validation | [`resume-admin/docs/jobmail-tailored-cv.md`](../resume-admin/docs/jobmail-tailored-cv.md) |
| resume-core | Isolated workflow, transient rendering overlay, one-day artifact | [`resume-core/docs/jobmail-tailored-cv.md`](../resume-core/docs/jobmail-tailored-cv.md) |
| resume-data | Canonical private resume source; read only for tailored runs | Private repository |

## Security boundaries

- JobMail authenticates the signed-in Google user and verifies the one-to-one
  DevResume link before forwarding a request.
- JobMail and resume-admin share a high-entropy server-only secret checked with
  a timing-safe comparison. The browser never receives it.
- `JOBMAIL_GITHUB_TOKEN` exists only in resume-admin and is scoped to the
  minimum GitHub Actions/artifact operations.
- `RESUME_DATA_PAT` is used only by the GitHub Actions runner to read the
  private source repository; the tailored workflow has `contents: read` and no
  write permission.
- The artifact is validated as a PDF, capped at 5 MB at the bridge, named with
  the request ID, and retained for one day.
- Canonical resume data, Drive output, and normal notification channels are not
  modified by a tailored request.

## Operational checks

Before production enablement, verify a successful request, invalid secret,
unlinked account, malformed request ID, failed workflow, expired artifact, and
oversized/non-PDF artifact. Keep request context and PDF bytes out of logs and
rotate the integration secret or GitHub token if either is exposed.
