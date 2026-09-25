# ScamVanta

**Can you spot the scam before it spots you?**

A complete, independent educational web app for students and beginners. Practice recognizing online scams in fictional digital situations, get immediate explanations, and build safer verification habits.

The application uses only HTML, CSS, and vanilla JavaScript. No Node.js, packages, build process, API, database, account, or paid service is required. It works on GitHub Pages, including a repository subdirectory.

## Features

- 35 original scenarios: five in each of seven categories, with Beginner, Intermediate, and Advanced difficulties.
- Five-question category sessions and ten-question mixed challenges covering every category.
- Random question and answer order; unseen and less-recently completed scenarios are prioritized. Questions never repeat within a session. The first question avoids the previous answered question when the session has alternatives. A retry with just one missed question necessarily repeats that question.
- Immediate feedback, warning signs, recommended safe actions, and explicit Next buttons.
- Points and streak bonuses without a timer or speed rewards.
- Session results, accuracy, category breakdowns, missed-question review, and targeted study recommendations.
- Browser-only progress, saved unfinished sessions, theme preferences, and confirmed reset.
- Ten concise lessons on warning signs, plus How It Works and About screens.
- Responsive dark/light themes, keyboard answers, visible focus, and reduced-motion support.
- No external fonts, images, or advertisements. Optional GA4 usage statistics are disabled by default and require visitor opt-in.

## Files

```text
scamvanta/
├── index.html      # Entry point, navigation, footer, confirmation dialog
├── styles.css      # Responsive layout, dark/light colors, accessibility styles
├── analytics-config.js # Owner toggle and GA4 Measurement ID
├── analytics.js    # Consent, event allowlist, optional Google loader
├── script.js       # Screens, scoring, validation, storage, keyboard controls
├── scenarios.js    # All scenario content; edit this to add questions
├── README.md       # This guide
├── LICENSE         # MIT license
├── .gitignore      # Excludes local/editor/temporary files
└── 404.html        # Helpful page for missing URLs
```

## Run locally

1. Download and extract the ZIP. Open the extracted `scamvanta` folder.
2. Use a simple local web server. One beginner option is the free Visual Studio Code editor with a local-server extension such as Live Server: open the folder, right-click `index.html`, and choose **Open with Live Server**.
3. Alternatively, if Python 3 is already installed, open a terminal in the folder and run:

   ```sh
   python -m http.server 8000 --bind 127.0.0.1
   ```

   On Windows, use `py -m http.server 8000 --bind 127.0.0.1` if `python` is not recognized.
4. Open `http://127.0.0.1:8000/` in your browser. Keep the terminal open. Press Ctrl+C in that terminal to stop the server.

Python is only an optional local preview tool; it is not part of the app and is not needed on GitHub Pages. Do not rely on opening `index.html` with a `file://` URL: storage behavior varies there.

## How to edit or add scenarios

Open **`scenarios.js`** in a text editor. The file assigns an array to `window.SCENARIOS`. Each object is one question. Copy an existing object, put a comma between objects, and give the new one a unique, permanent ID. For example, add this object before the final `];` (add a comma after the previous object):

```javascript
{
  id: 'email-06',
  category: 'Phishing emails',
  difficulty: 'Beginner',
  title: 'The unrequested club ballot',
  format: 'Email',
  message: 'A message from votes@club-ballot.example.com asks you to reply with your school password to vote for a club mascot. You were not told about a ballot.',
  options: [
    'Reply with your password so your vote counts.',
    'Ask the club adviser through your usual school channel without replying to the message.',
    'Forward the request to every classmate.'
  ],
  correct: 1,
  explanation: 'Voting does not justify giving a sender your school password. Checking with the adviser independently avoids relying on the suspicious message.',
  warnings: ['An unexpected ballot', 'A request for your school password'],
  action: 'Keep your password private and check with the club adviser using a known contact.'
}
```

`correct` counts from zero: `0` is the first option, `1` the second, and so on. The app shuffles the options for display and preserves the correct mapping. Use two to four distinct options and exactly one best response.

Use one of these exact categories:

- `Phishing emails`
- `Text-message scams`
- `Fake websites`
- `Password security`
- `Online shopping scams`
- `Social engineering`
- `Tech-support scams`

Difficulty must be `Beginner`, `Intermediate`, or `Advanced`. Include nonempty `title`, `format`, `message`, `explanation`, `warnings`, and `action` fields. Use `\n` within a message for line breaks. Do not reuse an ID or change the meaning/order of options for an existing ID once people have saved answers; assign a new ID for a substantially revised scenario.

Keep all names fictional and all addresses under reserved domains such as `example.com`, `example.net`, or `example.org`. Do not add real credentials, real malicious links, or real login forms. The app renders scenario content as text, so URLs are not clickable and HTML is not interpreted.

Reload after editing. The app checks scenario fields, IDs, answer ranges, categories, and difficulty at startup; invalid data shows an error screen and a diagnostic in the browser console. It requires at least 30 valid scenarios and at least one per category. Category sessions choose up to five questions even after more are added. Counts update automatically.

If you remove IDs used in saved progress, the old record will fail validation and a fresh record will be used, with a visible notice. Exporting or migrating old records is not a feature of this app.

## Scoring

- Correct answer: **100 points**.
- Consecutive correct answers: **+10** for the second, **+20** for the third, **+30** for the fourth, **+40** for the fifth, and **+50** for the sixth and all later consecutive correct answers.
- Incorrect answer: **0 points**, streak returns to zero, and no points are deducted.
- Every new session, including retries, starts a new streak. Speed has no effect.
- Five perfect answers earn 600 points. Ten perfect answers earn 1,350 points.
- Accuracy is correct answers divided by all submitted answers, rounded to the nearest whole percent.
- A retry is a new practice attempt and counts in overall statistics. Unique completed scenarios are counted separately.

After submission, all answers lock. The recorded answer is saved before feedback is shown. Reloading, clicking again, pressing a number again, or revisiting feedback does not award points twice. This is a learning app, not a tamper-proof exam: someone can intentionally edit their own browser storage or source code.

## Saved progress

The `scamspotter.v1` localStorage entry holds the selected theme, validated answer history (scenario ID, selected answer, session ID), and current session (question order, answer order, current position, submitted answers).

Total completed attempts, overall accuracy, best streak, category performance, and unique completed IDs are retained through that history and recalculated on load. This avoids inconsistent separately stored totals. **Continue** is disabled until an unfinished session exists. A submitted answer stays locked when you continue; press **Next** to move on. Starting a new session asks before replacing unfinished work. The last completed session remains available under **My progress → View last results** until another session replaces it.

Progress is specific to a browser profile and origin (protocol, host, and port). Local preview and GitHub Pages do not share it. Changing local ports, browsers, or devices starts a separate record. Browsers on the same GitHub Pages origin share storage between repository paths; this app uses its own namespaced key. Private browsing may discard progress. Clearing browser data deletes it.

Missing storage starts fresh. Corrupted or incompatible records are rejected with a visible notice. If storage is blocked or full, the app continues in memory and warns that progress may not survive closing or refreshing. Other localStorage keys are never reset. **Reset Progress** clears the app’s record and theme preference after confirmation; Cancel and Escape keep the existing record.

Open tabs listen for storage changes and recheck before answering. Use one tab at a time for training; browser storage is not a multi-user database.

## Accessibility and privacy

Semantic landmarks, a skip link, labeled controls, native buttons, a modal confirmation, descriptive titles, and progress labels support navigation. Tab moves between controls; Enter or Space activates a focused button; number keys 1–4 submit a quiz answer. Modifier combinations and repeated keydown events are ignored. Escape cancels a confirmation. Mobile navigation has an announced expanded/collapsed state.

Feedback moves focus to the explanation. Correct and incorrect responses use symbols and text as well as color. Motion follows `prefers-reduced-motion`. Themes provide strong text contrast. There is no timer. Real assistive-technology testing is still valuable; this project does not claim accessibility certification.

No accounts or personal-information fields are present. Detailed answer history stays in the browser. Optional Google Analytics sends the limited events described below only after owner configuration and visitor opt-in. Google processes browser/connection metadata and session cookies; reports are aggregate, but individual events are transmitted. Your chosen web host may process ordinary connection data according to its own policies.

ScamVanta is an independent educational project. All scenarios, names, messages, and addresses are fictional and are provided for educational purposes only. Never interact with a suspicious message or link. Verify concerns through an organization’s official website or phone number.

Education cannot guarantee protection from every scam.

## Publish on GitHub Pages — no command line needed

1. Visit [GitHub](https://github.com/), choose **Sign up**, create a username and account, and complete the email verification. If you already have an account, sign in.
2. Use the **+** menu in the upper-right corner and select **New repository**.
3. Name the repository exactly **`scamvanta`**. Choose **Public**. You can leave the automatic README, license, and .gitignore options unchecked because these files are included. Select **Create repository**.
4. In the empty repository, use the **uploading an existing file** link. If the repository already contains a file, select **Add file → Upload files**.
5. Open the extracted `scamvanta` folder on your computer. Upload the **files inside it**, not the containing folder and not the ZIP. `index.html`, `styles.css`, `script.js`, and `scenarios.js` must sit directly in the repository root. Include analytics-config.js, analytics.js, README, LICENSE, 404 page, and .gitignore too. Enable hidden-file visibility if needed to see `.gitignore` (Windows: File Explorer → View → Show → Hidden items; macOS: Command+Shift+period).
6. Enter a commit message such as “Add ScamVanta app,” select the `main` branch if asked, and choose **Commit changes**.
7. Open the repository’s **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**.
8. Under Branch, choose **main** and **/(root)**. Select **Save**.
9. Wait for the Pages deployment to finish. Reload **Settings → Pages** and look for the site address or **Visit site**. Check the repository’s **Actions** tab if deployment is still running or failed.
10. Your usual address will be **`https://YOUR-USERNAME.github.io/scamvanta/`**. Replace `YOUR-USERNAME` with your actual username. Open it and run a short test session.

GitHub’s interface can change. The source settings are documented in [GitHub’s official Pages publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). No custom domain, build command, environment variable, API key, or paid service is needed for this public-repository setup.

### Optional: upload with Git instead

Create the empty public repository first. From a terminal inside the local `scamvanta` folder, with Git installed:

```sh
git init
git add .
git commit -m "Add ScamVanta app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/scamvanta.git
git push -u origin main
```

Replace `YOUR-USERNAME`. Follow Git’s authentication prompts; do not put passwords or tokens into project files. Then complete the Pages settings above. These commands assume the new remote repository is empty.

## Update the published website later

1. Edit your local files and test them with the local server.
2. Open the GitHub repository’s **Code** tab. Choose **Add file → Upload files** and upload the updated files with their original names into the root, replacing the previous versions. Or open an individual file in GitHub, use its pencil/edit button, and make the change there.
3. Select **Commit changes**, describe the change, and commit to `main`.
4. GitHub Pages redeploys from that branch automatically. Check **Actions** for success; you normally do not need to change Settings → Pages again.
5. Refresh the published URL. If you see old content, hard-refresh (Ctrl+Shift+R on Windows/Linux, Command+Shift+R on macOS).
6. Re-test your changes, including one quiz answer and Continue. Do not change existing scenario IDs or option meanings casually, because returning visitors may have saved answers.

With Git, after editing use `git add .`, `git commit -m "Describe your change"`, and `git push` instead of browser upload.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Pages shows 404 | Confirm `index.html` is in the root of `main`, not inside a second `scamvanta` folder. Confirm Pages is enabled for `main` and `/(root)` and that Actions shows a successful deployment. |
| No main branch in Pages settings | Upload and commit the files first, then reopen settings. |
| Missing colors or buttons do nothing | Confirm `styles.css`, `scenarios.js`, and `script.js` are uploaded with exactly those lowercase names next to `index.html`. Check the browser console for missing files. |
| “Training could not load” | Check commas, quotation marks, unique IDs, exact category/difficulty spelling, and `correct` indices in `scenarios.js`. Open developer tools → Console to see the invalid ID or syntax error. |
| Continue is disabled | There is no unfinished saved session in this browser/origin. Start Training, then leave or reload while the session is unfinished. Completed sessions are under My progress. |
| Progress disappears | Check private browsing, blocked/full storage, changed browser/port/domain, or cleared site data. Watch for the in-app storage warning. |
| Old answers appear after editing | Preserve IDs and option meanings. For major content changes, test with Reset Progress; returning users may have old records. |
| A link ending in a made-up path fails | App screens use hashes, such as `index.html#learn`, not server routes like `/learn`. Use the navigation links. The 404 page offers a return to the app. |
| Changes are not visible | Wait for deployment to finish, check Actions, then hard-refresh. |
| Local command is not found | Install Python 3 or use a local-server editor extension. Neither is needed on the published website. |

## Manual test checklist after changes

- Visit Home, categories, learning, How It Works, About, and My progress.
- Start each category; check its questions and all answer choices.
- Finish a mixed session; verify results, category totals, and missed-question review.
- Try incorrect answers, consecutive correct answers, rapid repeat clicks, and number keys after submission.
- Reload both before answering and after feedback; Continue must preserve the question, order, and locked answer.
- Try Retry missed scenarios, New mixed challenge, Save & leave, and Return home.
- Test the light theme across a reload. Test Reset → Cancel, Escape, and Reset → confirm.
- Test Tab/Enter and keys 1–4, mobile menu, a narrow viewport, and reduced motion.
- Inspect developer tools → Console for unexpected errors.

## Résumé or college application description

“Developed ScamVanta, a responsive cybersecurity learning app using HTML, CSS, and vanilla JavaScript. Created 35 original interactive scenarios across seven topics, implemented local progress persistence and personalized review, and added keyboard-accessible training and dark/light themes.”

Use this description only to represent work you understand and can explain. Credit assistance appropriately under your school’s or program’s rules. Do not claim to have independently written work that was assisted.

## Future usage numbers and feedback

No public usage numbers or user feedback have been collected for this delivery. Fill in this section later using actual evidence; do not invent results. Optional analytics is included but disabled and has not collected production data for this delivery.

| Measure | Verified value | Date range | Evidence or collection method |
| --- | --- | --- | --- |
| Participants in an observed test | Not measured | Not recorded | Not collected |
| Sessions completed in an observed test | Not measured | Not recorded | Not collected |
| Voluntary feedback themes | Not collected | Not recorded | Not collected |
| Improvements made from feedback | None recorded | Not recorded | Not collected |

If you collect feedback later, obtain permission, avoid personal information, and record aggregate observations. Ask before quoting someone’s comments publicly. Local progress is not a measure of unique visitors to a published site.

## License

MIT; see `LICENSE`. Original scenario text and interface code are included under that license.

## Optional analytics: setup and privacy

Analytics is **off by default**. No Google script or analytics request is made until BOTH the owner configures it and the visitor clicks **Allow usage statistics** in the footer. Ignoring the choice keeps it off. Global Privacy Control and Do Not Track also keep it off. The app works when the config/module is absent, Google is blocked, or storage is unavailable.

### Exactly where to paste your Measurement ID

1. Create a GA4 property and web data stream for your GitHub Pages site. Copy its **Measurement ID** (starts with `G-`); do not use the numeric property ID.
2. Before enabling, turn **Enhanced measurement OFF** for that stream (including automatic page views/history changes, clicks, search, forms, downloads and scrolls). This app emits its own sanitized page views. Leave Google signals and user-provided data collection OFF, disable granular location/device collection in all regions, disable advertising personalization, do not connect Google Ads or other destinations, and choose the shortest available event retention (normally 2 months). Avoid custom tags that capture additional information. These property-side settings cannot be enforced by these source files.
3. Open **analytics-config.js** in the same folder as index.html. Paste your real ID inside the empty quotes on `measurementId: ''`. Change `enabled: false` to `enabled: true`. No real ID is bundled; the blank value disables integration.
4. Upload both analytics files along with the updated index.html, script.js, and README to your existing GitHub Pages repository root. Keep scenarios.js and styles.css present. No backend or build step is required.
5. Open the published site, choose **Allow usage statistics**, then complete a quiz. Check GA4 Realtime for the events. Standard reports can take time. No production delivery was verified for this package because no real Measurement ID was supplied.

Google setup references: [configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config), [granular location/device controls](https://support.google.com/analytics/answer/12002752), [Google data safeguards](https://support.google.com/analytics/answer/6004245).

### Events and meaning

| Event | Allowed custom values | Trigger |
| --- | --- | --- |
| page_view | Fixed screen title, site origin/path + allowlisted screen; empty referrer | Initial screen after opt-in and subsequent screen changes; query strings and arbitrary hashes excluded |
| quiz_start | category (one of seven categories, Mixed challenge, or Missed-scenario practice) | A new session actually starts; resuming does not count |
| category_selected | category | A category session actually starts; canceled replacements do not count |
| scenario_answered | category, difficulty, correct (0 or 1) ONLY | First accepted answer, never a reload or duplicate click |
| quiz_complete | category, score (points), accuracy (0–100) | Final feedback Next/results action completes the session; revisiting results does not count |
| lesson_viewed | lesson (fixed lesson slug or overview) | Entering learning overview or a targeted lesson route; does not imply reading every card |
| retry_missed | none | A missed-question retry session actually starts, also emitting quiz_start |

Create event-scoped custom dimensions for category, difficulty, and lesson, and custom metrics for correct, score, and accuracy if needed in reports. Use event count for starts/completions. Compute completion rate as completed / started within an appropriate date range; sessions crossing the boundary and opt-in/out mid-quiz affect it. Average accuracy is the mean of completed-quiz percentages, not a weighted per-answer average. Retried quizzes count as new attempts. Session cookies expire with the browser session: unique/returning-user figures are not reliable measures of real people. Page views include navigation; they are not unique visits. GA4 may also produce its standard session/engagement events and metadata.

### What is and is not transmitted

No names, emails, typed content, scenario IDs/text, answer option/text, stored history, app session IDs, user IDs, or user properties are attached to custom events. Numeric score/accuracy support aggregate reporting; they are sent per completion, not pre-aggregated on the device. Category/difficulty/correctness are sent per answer. These are educational usage measures, not evidence of learning improvement by themselves.

GA4 is not a zero-personal-data or anonymous collection service: it receives the connection IP in transit and browser metadata and uses analytics identifiers/cookies. Google states GA4 does not log/store individual IP addresses, but derives approximate location. No precise geolocation API is used. Advertising consent is denied; Google signals and ad personalization are disabled in code. The app sets session-lifetime, host/path-scoped analytics cookies and strips query strings, arbitrary hashes and referrers from configured page data. A site's host may independently process request metadata. If your requirement is literally no provider processing of identifying metadata, leave analytics disabled.

Consent is stored separately as `scamspotter.analytics-consent.v1`. If storage is unavailable, consent lasts only in memory. **Turn off usage statistics** stops further collection, clears this integration's analytics cookies at its configured path, and reloads the page to unload Google; previously received data is not deleted. Other open tabs observe withdrawal when storage is available. **Reset Progress** still resets only the original training record/theme; it does not change consent. Changing consent never deletes progress. Consent is remembered per origin, like the existing progress key.

Events before opt-in or during failures are not replayed from saved history. A bounded in-memory queue holds up to 100 sanitized events while the Google script loads; load errors or a 10-second timeout discard it. Analytics is best-effort, so blockers, connection failures, privacy preferences and navigation away can reduce counts. Do not interpret them as all visitors or guaranteed unique people.

### Verification

See TEST-REPORT.md for automated browser results. For a real deployment, also verify the property-side settings above and inspect Realtime after providing your ID. To disable collection site-wide, set `enabled: false` and redeploy; visitors with an already-open old page must refresh.

## Name and saved-data compatibility

The project is now called ScamVanta. The internal browser storage keys retain their original spelling so existing progress and privacy choices remain compatible on the same origin. All website branding, analytics titles, repository instructions, and folder names use ScamVanta.
