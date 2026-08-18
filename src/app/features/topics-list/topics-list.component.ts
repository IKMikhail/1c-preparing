import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { QuestionBankService } from '../../core/services/question-bank.service';
import { ResultsHistoryService } from '../../core/services/results-history.service';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss',
})
export class TopicsListComponent {
  private readonly questionBank = inject(QuestionBankService);
  private readonly resultsHistory = inject(ResultsHistoryService);
  private readonly router = inject(Router);

  readonly topics = toSignal(this.questionBank.getTopics(), { initialValue: [] });

  readonly lastAttemptByTopic = computed(() => {
    const map = new Map<string, { scorePercent: number; passed: boolean }>();
    for (const topic of this.topics()) {
      const history = this.resultsHistory.getHistoryForTopic(topic.id);
      if (history.length > 0) {
        map.set(topic.id, { scorePercent: history[0].scorePercent, passed: history[0].passed });
      }
    }
    return map;
  });

  startExam(topicId: string): void {
    this.router.navigate(['/exam', topicId]);
  }
}
