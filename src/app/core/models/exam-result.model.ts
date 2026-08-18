/**
 * The recorded outcome for a single question within a finished exam attempt.
 */
export interface QuestionAttempt {
  questionId: string;
  questionText: string;
  answers: {
    id: string;
    text: string;
    correct: boolean;
    selected: boolean;
  }[];
  isCorrect: boolean;
  markedForReview: boolean;
}

/**
 * The full outcome of one completed exam attempt, ready to be shown on the results
 * screen and persisted to history.
 */
export interface ExamResult {
  topicId: string;
  topicTitle: string;
  startedAt: string; // ISO timestamp
  finishedAt: string; // ISO timestamp
  timeSpentSeconds: number;
  attempts: QuestionAttempt[];
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  passThreshold: number;
  passed: boolean;
}
