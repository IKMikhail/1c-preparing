/**
 * A topic / exam ticket: a named group of questions the learner can start an exam session on.
 *
 * NOTE: The concrete topics shipped in `src/assets/data/questions.json` are PLACEHOLDER
 * example data, not real 1C exam tickets. See that folder's README.
 */
export interface Topic {
  id: string;
  title: string;
  description?: string;
  /** Ordered ids of the questions that make up this topic's exam. Resolved against the question bank at runtime. */
  questionIds: string[];
  /** Optional countdown timer for the exam session, in whole minutes. If omitted, the timer counts up instead. */
  timeLimitMinutes?: number;
  /** Fraction (0..1) of correct answers required to pass. Defaults to 0.7 if not specified. */
  passThreshold?: number;
}

/** Raw shape of the JSON question bank asset file. */
export interface QuestionBankData {
  topics: Topic[];
  questions: import('./question.model').Question[];
}
