# Design & CSS Guidelines: Automated Resume Pipeline

This document provides styling and layout instructions for the AI agent or developer building the `template.html` and `styles.css` files. The goal is to generate a professional, ATS-friendly PDF using Puppeteer.

---

## 1. Page Format & Print Settings (Puppeteer Specific)
Since the final output is a PDF generated via Headless Chrome, the CSS must be optimized for print.
*   **Page Size:** Standard A4.
*   **Margins:**
    ```css
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    ```
*   **Page Breaks:** Prevent sections or bullet points from splitting across two pages.
    ```css
    .section, .project-item, .work-item {
      page-break-inside: avoid;
    }
    ```
*   **Backgrounds:** Ensure `printBackground: true` is set in the Puppeteer script if any background colors are used, though a clean white background is preferred.

## 2. Typography
*   **Font Family:** Use modern, clean, sans-serif fonts (e.g., 'Inter', 'Roboto', 'Helvetica Neue', Arial). Include a web font link (like Google Fonts) in the HTML head.
*   **Font Sizes:**
    *   Name (Header): 24pt - 28pt (Bold)
    *   Section Titles: 12pt - 14pt (Bold, Uppercase, with a bottom border for separation)
    *   Job/Project Titles: 11pt - 12pt (Bold)
    *   Body Text (Bullet points, descriptions): 9.5pt - 10.5pt
*   **Line Height:** 1.4 to 1.5 for readability.

## 3. Color Palette
Keep it minimalist, professional, and printer-friendly.
*   **Primary Text:** `#1F2937` (Dark Gray/Black) for best readability.
*   **Secondary Text (Dates, Locations, Links):** `#4B5563` (Medium Gray).
*   **Accents (Optional):** Use a subtle professional color like Dark Blue (`#1D4ED8`) or Teal for links or section borders. Do not use heavy background colors.

## 4. Layout & Grid (Flexbox)
*   **Header:** Center-aligned or Flex-row. Name at the top, Title below it, and contact info (Email, Phone, Portfolio, GitHub) rendered inline with simple bullet separators (•).
*   **Sections:** Use a single-column layout. A single-column layout is the most ATS-friendly and easiest to read.
*   **Spacing:** Use consistent padding and margins. E.g., `margin-bottom: 15px;` for sections, and `margin-bottom: 8px;` for individual project/work items.
*   **Lists:** Remove default bullet padding and use custom styling for `<ul>` and `<li>` to save space while keeping it neat.

## 5. Handlebars Data Binding Rules
When writing the `template.html`, ensure strict mapping to the `sample-resume.json` structure:
*   Use `{{#each projects}}` for iterating through the projects array.
*   Inside a project/work item, use `{{#each this.highlights}}` to render the bullet points.
*   For skills, render them inline: `<b>{{this.name}}:</b> {{this.keywords}}`.

## 6. Target Output Aesthetic
The final PDF should look identical to a traditional, highly polished Software Engineering CV. It should be dense enough to fit a lot of information (Projects, Experience, Skills) but utilize whitespace effectively so it does not look cluttered.
