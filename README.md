# Operative Note · บันทึกการผ่าตัด

A bilingual (Thai/English) web app for writing structured operative notes in colorectal and anorectal surgery. Surgeons fill in a form on a phone or computer, mark findings on anatomical diagrams, generate a draft operative narrative from the recorded fields, and print or save a formatted note on a hospital letterhead.

Live site: https://colovjr.com (GitHub Pages)

## Features
- Field templates for common, colorectal, fistula, hemorrhoid and other procedures, with every field labelled in Thai and English.
- **"Draft from the fields above":** builds the step-by-step narrative only from fields that have been filled in, so the draft never states something that was not recorded.
- Vector (SVG) anatomical figures, including anorectal diagrams, for marking findings. They print sharply at any size.
- Print / PDF output sized for the hospital form.
- Optional team registry in a Google Sheet, protected by a passcode.
- Works offline from built-in default templates when the Sheet is unreachable.

## Stack
| Layer | Technology |
|---|---|
| Front end | Plain HTML, CSS and JavaScript (no build step, no framework) |
| Hosting | GitHub Pages, with a custom domain via `CNAME` |
| Back end | Google Apps Script web app bound to a Google Sheet (the script lives in the Sheet, not in this repo) |
| Storage | Google Sheet: a `Templates` tab (field definitions), a `Config` tab (passcode) and the records |
| Testing | `_test.js`, a headless smoke test using jsdom; `check.html` is a print-layout check page |

## Files
| File | Purpose |
|---|---|
| `index.html` | App shell and UI |
| `app.js` | App logic: forms, saving, printing, Sheet sync |
| `config.js` | **The only file to edit before publishing:** the Apps Script web-app URL and login setting |
| `templates.js` | Default field definitions, used only when the Sheet cannot be reached |
| `narrative.js` | Sentence templates for the narrative draft |
| `figures.js`, `figures-anorectal.js`, `figures-original.js` | SVG anatomical diagrams |
| `letterhead.js` | Embedded letterhead logo (base64 PNG) |
| `CNAME` | Custom domain for GitHub Pages |

## Privacy and data
- **This repository contains code only. No patient data is stored in it.** There are no names, HNs or records, and no example data from real patients.
- Notes entered in the app are saved to the team's private Google Sheet, which only authorised staff can access. The Apps Script refuses to read or write anything without the team passcode.
- The Apps Script URL in `config.js` can be read by anyone who views the page source; that is unavoidable for a static site. Protection comes from the passcode, which is set in the Sheet and never committed here.
- The device stores the passcode and settings in the browser's `localStorage`. Use the app on trusted devices only.

## Deploy your own copy
1. **Sheet and script.** Create a Google Sheet and add the Apps Script back end (Extensions ▸ Apps Script). Deploy it as a web app via Deploy ▸ New deployment ▸ Web app, and copy the URL that ends in `/exec`.
2. **Passcode.** In the Sheet, use **Operative Note ▸ Set team passcode** to set it in the `Config` tab.
3. **Config.** Paste the `/exec` URL into `scriptUrl` in `config.js`. Keep `requireLogin: true`.
4. **Publish.** Push to GitHub and enable Settings ▸ Pages ▸ Deploy from branch `main` / root. To use your own domain, put it in `CNAME` and point your DNS to GitHub Pages. Otherwise delete `CNAME`.
5. **Templates.** Edit fields in the Sheet's `Templates` tab; no code changes are needed.

Run the smoke test locally with:
```bash
npm install jsdom
node _test.js
```
(`_test.js` currently loads jsdom from `/tmp/node_modules`; change the `require` path if you installed it elsewhere.)

## Author
Thanat Tantinam, MD, PhD, a colorectal surgeon.

## License
MIT. See `LICENSE`. The letterhead crest belongs to its institution and is not covered by the MIT license.
