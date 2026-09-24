/**
 * A topic / exam ticket: a named group of questions the learner can start an exam session on.
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

/** The assembled question bank: all topics and all questions. */
export interface QuestionBankData {
  topics: Topic[];
  questions: import('./question.model').Question[];
}

/** Raw shape of `assets/data/index.json`: section file paths (relative to `assets/data/`), in display order. */
export interface QuestionBankIndex {
  sections: string[];
}

/** Raw shape of one section file in `assets/data/sections/`: a topic plus its questions. */
export interface QuestionBankSection {
  topic: Topic;
  questions: import('./question.model').Question[];
}
