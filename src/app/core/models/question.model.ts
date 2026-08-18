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
 *
 * NOTE: The concrete question content shipped in `src/assets/data/questions.json`
 * is PLACEHOLDER example data, not real 1C exam content. See that folder's README.
 */
export interface Question {
  id: string;
  topicId: string;
  text: string;
  answers: Answer[];
  /** If true, more than one answer may (and might need to) be selected. Defaults to false (single choice). */
  allowMultiple?: boolean;
}
