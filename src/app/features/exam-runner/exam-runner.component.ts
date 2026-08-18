import { Component, DestroyRef, OnInit, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ExamService } from '../../core/services/exam.service';

@Component({
  selector: 'app-exam-runner',
  standalone: true,
  templateUrl: './exam-runner.component.html',
  styleUrl: './exam-runner.component.scss',
})
export class ExamRunnerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly exam = inject(ExamService);

  notFound = false;

  readonly minutesLeft = computed(() => {
    const remaining = this.exam.remainingSeconds();
    return remaining === null ? null : Math.floor(remaining / 60);
  });
  readonly secondsLeft = computed(() => {
    const remaining = this.exam.remainingSeconds();
    return remaining === null ? null : remaining % 60;
  });
  readonly elapsedMinutes = computed(() => Math.floor(this.exam.elapsedSeconds() / 60));
  readonly elapsedSecondsPart = computed(() => this.exam.elapsedSeconds() % 60);

  constructor() {
    // A finished result can come either from clicking "finish" below or from
    // ExamService auto-finishing the exam when the countdown runs out. Either way,
    // navigate to the results screen as soon as a result appears.
    effect(() => {
      if (this.exam.lastResult()) {
        this.router.navigate(['/result']);
      }
    });

    this.destroyRef.onDestroy(() => this.exam.stopTimer());
  }

  ngOnInit(): void {
    const topicId = this.route.snapshot.paramMap.get('topicId');
    if (!topicId) {
      this.notFound = true;
      return;
    }
    this.exam.startExam(topicId).subscribe((loaded) => {
      this.notFound = !loaded;
    });
  }

  pad(value: number | null): string {
    if (value === null) {
      return '00';
    }
    return value.toString().padStart(2, '0');
  }

  selectAnswer(answerId: string): void {
    this.exam.selectAnswer(answerId);
  }

  finishExam(): void {
    const unanswered = this.exam.totalQuestions() - this.exam.answeredCount();
    if (unanswered > 0) {
      const proceed = confirm(
        `Вы не ответили на ${unanswered} вопрос(ов). Завершить экзамен всё равно?`,
      );
      if (!proceed) {
        return;
      }
    }
    this.exam.finishExam();
  }

  backToTopics(): void {
    this.exam.stopTimer();
    this.router.navigate(['/topics']);
  }
}
