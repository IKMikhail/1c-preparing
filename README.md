# 1С: Экзаменатор — пример тренажёра (1c-preparing)

An Angular exam-trainer app modeled after the "1С:Экзаменатор" study tool: pick a
topic/ticket, answer single- or multi-choice questions with navigation between
them, mark questions "for review", watch a timer, and see a results screen with
a per-question breakdown at the end.

**The question bank is placeholder data.** `src/assets/data/questions.json`
contains generic example questions/answers only, to demonstrate the data shape —
see `src/assets/data/README.md`. Replace it with a real question bank later;
no code changes are required as long as the JSON shape matches.

## Architecture

- `src/app/core/models` — `Question`, `Topic`/`QuestionBankData`, `ExamResult`/`QuestionAttempt`.
- `src/app/core/services`
  - `QuestionBankService` — loads `src/assets/data/questions.json` via `HttpClient`.
  - `ExamService` — signal-based exam session state: current question index,
    selected answers, "marked for review" flags, the timer, and grading.
  - `ResultsHistoryService` — persists finished attempts to `localStorage`.
- `src/app/features/topics-list` — pick a topic and start an exam.
- `src/app/features/exam-runner` — the exam screen (question navigator, answer
  options, mark-for-review, timer, finish).
- `src/app/features/result` — score, pass/fail, and per-question breakdown.

Routing uses `HashLocationStrategy` (`withHashLocation()` in `app.config.ts`) so
deep links work under GitHub Pages' `/1c-preparing/` sub-path without any
server-side rewrite configuration.

## Development server

```bash
ng serve
```

Open `http://localhost:4200/`.

## Building

```bash
ng build
```

Build artifacts are written to `dist/1c-preparing/browser`. For a GitHub Pages
build with the correct sub-path base href:

```bash
ng build --configuration production --base-href /1c-preparing/
```

## Running unit tests

```bash
ng test --watch=false
```

Runs headlessly via [Vitest](https://vitest.dev/).

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/1c-preparing/browser`
to GitHub Pages on every push to `master`, using the modern
`actions/upload-pages-artifact` + `actions/deploy-pages` flow.

## Additional resources

This project was generated with [Angular CLI](https://github.com/angular/angular-cli)
22.1.4. See the [Angular CLI docs](https://angular.dev/tools/cli) for more.
