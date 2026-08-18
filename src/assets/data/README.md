# Placeholder question bank

`questions.json` in this folder is **example / placeholder data only**.

It exists to demonstrate the data shape the app expects (`QuestionBankData` —
see `src/app/core/models/topic.model.ts` and `question.model.ts`):

- `topics`: an array of `Topic` objects, each referencing an ordered list of
  `questionIds`, an optional per-topic countdown (`timeLimitMinutes`) and pass
  threshold (`passThreshold`, fraction 0..1).
- `questions`: a flat array of `Question` objects, each with a `topicId`, the
  question `text`, an `answers` array (`{ id, text, correct }`), and an
  optional `allowMultiple` flag for multi-select questions.

The question/answer text in this file is intentionally generic
(`[Пример вопроса] ...`) — it does **not** represent real 1C:Предприятие exam
content. Replace the contents of `questions.json` with a real question bank
before using this app to actually study for the exam. As long as the replacement
JSON matches the same shape, no code changes are required.
