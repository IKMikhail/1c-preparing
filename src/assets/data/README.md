# Question bank

The real question bank for the trainer is split into one file per section:

- `index.json` — `{ "sections": [...] }`: paths (relative to this folder) of the
  section files, in the order the topics are shown.
- `sections/razdel-N.json` — `{ "topic": Topic, "questions": Question[] }` for one
  section (see `src/app/core/models/topic.model.ts` and `question.model.ts`).

`QuestionBankService` loads the index and every listed section, and merges them
into one `QuestionBankData` (`topics` + a flat `questions` array).

- `topic`: a `Topic` referencing an ordered list of `questionIds`, an optional
  countdown (`timeLimitMinutes`) and pass threshold (`passThreshold`, fraction 0..1).
- `questions`: `Question` objects, each with a `topicId`, the question `text`, an
  `answers` array (`{ id, text, correct }`), and an optional `allowMultiple` flag
  for multi-select questions.

Currently loaded:
- **Раздел 1: Общие механизмы, понятия и термины** (71 questions, single-choice)
- **Раздел 2: Редакторы и инструменты общие** (69 questions, single-choice)
- **Раздел 3: Редакторы и инструменты режима разработки** (69 questions — source numbering
  skips question 9, so ids go `r3-q1..r3-q8, r3-q10..r3-q70`)
- **Раздел 4: Конструкторы** (70 questions, single-choice)
- **Раздел 5: Технология разработки** (76 questions, single-choice)
- **Раздел 6: Объектная модель прикладного решения** (81 questions, single-choice)
- **Раздел 7: Табличная модель прикладного решения** (47 questions — source is missing
  question 47, so ids go `r7-q1..r7-q46, r7-q48`)
- **Раздел 8: Механизмы интеграции и обмена данными** (57 questions, single-choice)

To add a section, create `sections/razdel-N.json` and list it in `index.json`.
To extend a section, add questions to its file and their ids to `topic.questionIds`.

Answer options are shown in the order they appear in the section file (no shuffling).
