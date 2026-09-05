# Question bank

`questions.json` in this folder is the real question bank for the trainer.

It follows the `QuestionBankData` shape (see `src/app/core/models/topic.model.ts`
and `question.model.ts`):

- `topics`: an array of `Topic` objects, each referencing an ordered list of
  `questionIds`, an optional per-topic countdown (`timeLimitMinutes`) and pass
  threshold (`passThreshold`, fraction 0..1).
- `questions`: a flat array of `Question` objects, each with a `topicId`, the
  question `text`, an `answers` array (`{ id, text, correct }`), and an
  optional `allowMultiple` flag for multi-select questions.

Currently loaded:
- **Раздел 1: Общие механизмы, понятия и термины** (71 questions, single-choice)
- **Раздел 2: Редакторы и инструменты общие** (69 questions, single-choice)
- **Раздел 3: Редакторы и инструменты режима разработки** (69 questions — source numbering
  skips question 9, so ids go `r3-q1..r3-q8, r3-q10..r3-q70`)
- **Раздел 4: Конструкторы** (70 questions, single-choice)
- **Раздел 5: Технология разработки** (76 questions, single-choice)

More sections can be added the same way — either as more questions under an
existing topic, or as additional `Topic` entries with their own `questionIds`.

Answer options are shown in the order they appear in this file (no shuffling).
