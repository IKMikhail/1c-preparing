/**
 * A single selectable answer option belonging to a Question.
 */
export interface Answer {
  id: string;
  text: string;
  /** Whether this option is (one of) the correct answer(s). Never shown to the user during the exam. */
  correct: boolean;
}

/**
 * A single exam question.
 */
export interface Question {
  id: string;
  topicId: string;
  text: string;
  answers: Answer[];
  /** If true, more than one answer may (and might need to) be selected. Defaults to false (single choice). */
  allowMultiple?: boolean;
  /** Optional illustration shown above the question text (path under `src/assets`, e.g. `assets/images/foo.svg`). */
  imageUrl?: string;
}
