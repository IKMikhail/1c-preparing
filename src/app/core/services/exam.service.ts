import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, tap } from 'rxjs';

import { ExamResult, QuestionAttempt } from '../models/exam-result.model';
import { Question } from '../models/question.model';
import { Topic } from '../models/topic.model';
import { QuestionBankService } from './question-bank.service';
import { ResultsHistoryService } from './results-history.service';

export interface QuestionNavState {
  index: number;
  questionId: string;
  answered: boolean;
  marked: boolean;
  current: boolean;
}

/**
 * Drives a single exam session: which topic/questions are loaded, the current
 * question index, selected answers, "marked for review" flags, an elapsed-time
 * timer, and computing the final ExamResult when the exam is finished.
 */
@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly questionBank = inject(QuestionBankService);
  private readonly resultsHistory = inject(ResultsHistoryService);

  private readonly topicSignal = signal<Topic | null>(null);
  private readonly questionsSignal = signal<Question[]>([]);
  private readonly currentIndexSignal = signal(0);
  /** questionId -> selected answer ids */
  private readonly selectedAnswersSignal = signal<Record<string, string[]>>({});
  private readonly markedForReviewSignal = signal<Set<string>>(new Set());
  private readonly startedAtSignal = signal<Date | null>(null);
  private readonly elapsedSecondsSignal = signal(0);
  private readonly lastResultSignal = signal<ExamResult | null>(null);

  private timerHandle: ReturnType<typeof setInterval> | null = null;

  readonly topic = this.topicSignal.asReadonly();
  readonly questions = this.questionsSignal.asReadonly();
  readonly currentIndex = this.currentIndexSignal.asReadonly();
  readonly elapsedSeconds = this.elapsedSecondsSignal.asReadonly();
  readonly lastResult = this.lastResultSignal.asReadonly();

  readonly currentQuestion = computed<Question | null>(() => this.questionsSignal()[this.currentIndexSignal()] ?? null);
  readonly totalQuestions = computed(() => this.questionsSignal().length);

  readonly currentSelectedAnswerIds = computed<string[]>(() => {
    const q = this.currentQuestion();
    if (!q) {
      return [];
    }
    return this.selectedAnswersSignal()[q.id] ?? [];
  });

  readonly isCurrentMarked = computed(() => {
    const q = this.currentQuestion();
    return q ? this.markedForReviewSignal().has(q.id) : false;
  });

  /** Seconds left on the countdown, or null if the topic has no time limit (count-up mode). */
  readonly remainingSeconds = computed<number | null>(() => {
    const topic = this.topicSignal();
    if (!topic?.timeLimitMinutes) {
      return null;
    }
    const totalSeconds = topic.timeLimitMinutes * 60;
    return Math.max(0, totalSeconds - this.elapsedSecondsSignal());
  });

  readonly isTimeUp = computed(() => {
    const remaining = this.remainingSeconds();
    return remaining !== null && remaining <= 0;
  });

  /** Per-question state for the navigator (answered / marked / current). */
  readonly questionStates = computed<QuestionNavState[]>(() => {
    const selected = this.selectedAnswersSignal();
    const marked = this.markedForReviewSignal();
    const current = this.currentIndexSignal();
    return this.questionsSignal().map((q, index) => ({
      index,
      questionId: q.id,
      answered: (selected[q.id]?.length ?? 0) > 0,
      marked: marked.has(q.id),
      current: index === current,
    }));
  });

  readonly answeredCount = computed(() => this.questionStates().filter((s) => s.answered).length);
  readonly markedCount = computed(() => this.questionStates().filter((s) => s.marked).length);

  /**
   * Loads the topic and its questions and starts a fresh exam session (resets index,
   * selections, marks and timer). Emits the loaded topic/questions, or `null` if the
   * topic id could not be found.
   */
  startExam(topicId: string): Observable<{ topic: Topic; questions: Question[] } | null> {
    this.stopTimer();
    return forkJoin({
      topic: this.questionBank.getTopic(topicId),
      questions: this.questionBank.getQuestionsForTopic(topicId),
    }).pipe(
      tap(({ topic, questions }) => {
        if (!topic || questions.length === 0) {
          return;
        }
        this.topicSignal.set(topic);
        this.questionsSignal.set(questions.map((q) => ({ ...q, answers: this.shuffle(q.answers) })));
        this.currentIndexSignal.set(0);
        this.selectedAnswersSignal.set({});
        this.markedForReviewSignal.set(new Set());
        this.startedAtSignal.set(new Date());
        this.elapsedSecondsSignal.set(0);
        this.lastResultSignal.set(null);
        this.startTimer();
      }),
      map(({ topic, questions }) => (topic && questions.length > 0 ? { topic, questions } : null)),
    );
  }

  selectAnswer(answerId: string): void {
    const question = this.currentQuestion();
    if (!question) {
      return;
    }
    this.selectedAnswersSignal.update((byQuestion) => {
      const current = byQuestion[question.id] ?? [];
      let next: string[];
      if (question.allowMultiple) {
        next = current.includes(answerId) ? current.filter((id) => id !== answerId) : [...current, answerId];
      } else {
        next = [answerId];
      }
      return { ...byQuestion, [question.id]: next };
    });
  }

  isAnswerSelected(answerId: string): boolean {
    return this.currentSelectedAnswerIds().includes(answerId);
  }

  toggleMarkForReview(): void {
    const question = this.currentQuestion();
    if (!question) {
      return;
    }
    this.markedForReviewSignal.update((set) => {
      const next = new Set(set);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  }

  goTo(index: number): void {
    if (index >= 0 && index < this.questionsSignal().length) {
      this.currentIndexSignal.set(index);
    }
  }

  next(): void {
    this.goTo(this.currentIndexSignal() + 1);
  }

  prev(): void {
    this.goTo(this.currentIndexSignal() - 1);
  }

  /** Stops the running timer without discarding session state. Call e.g. from a component's ngOnDestroy. */
  stopTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  /** Grades the current session, records it to history, and returns the ExamResult. */
  finishExam(): ExamResult {
    this.stopTimer();
    const topic = this.topicSignal();
    const questions = this.questionsSignal();
    const selected = this.selectedAnswersSignal();
    const marked = this.markedForReviewSignal();

    const attempts: QuestionAttempt[] = questions.map((q) => {
      const selectedIds = new Set(selected[q.id] ?? []);
      const correctIds = new Set(q.answers.filter((a) => a.correct).map((a) => a.id));
      const isCorrect =
        selectedIds.size === correctIds.size && [...selectedIds].every((id) => correctIds.has(id));
      return {
        questionId: q.id,
        questionText: q.text,
        answers: q.answers.map((a) => ({
          id: a.id,
          text: a.text,
          correct: a.correct,
          selected: selectedIds.has(a.id),
        })),
        isCorrect,
        markedForReview: marked.has(q.id),
      };
    });

    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const totalCount = attempts.length;
    const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const passThreshold = topic?.passThreshold ?? 0.7;
    const passed = totalCount > 0 && correctCount / totalCount >= passThreshold;
    const startedAt = this.startedAtSignal() ?? new Date();

    const result: ExamResult = {
      topicId: topic?.id ?? '',
      topicTitle: topic?.title ?? '',
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      timeSpentSeconds: this.elapsedSecondsSignal(),
      attempts,
      correctCount,
      totalCount,
      scorePercent,
      passThreshold,
      passed,
    };

    this.lastResultSignal.set(result);
    this.resultsHistory.saveResult(result);
    return result;
  }

  /** Fisher-Yates shuffle; returns a new array, leaves the input untouched. */
  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerHandle = setInterval(() => {
      this.elapsedSecondsSignal.update((s) => s + 1);
      if (this.isTimeUp()) {
        this.finishExam();
      }
    }, 1000);
  }
}
