import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ExamService } from '../../core/services/exam.service';

@Component({
  selector: 'app-result',
  standalone: true,
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent implements OnInit {
  private readonly router = inject(Router);

  readonly exam = inject(ExamService);

  ngOnInit(): void {
    if (!this.exam.lastResult()) {
      this.router.navigate(['/topics']);
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  retry(): void {
    const topicId = this.exam.lastResult()?.topicId;
    if (topicId) {
      this.router.navigate(['/exam', topicId]);
    }
  }

  backToTopics(): void {
    this.router.navigate(['/topics']);
  }
}
