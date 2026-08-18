import { Injectable } from '@angular/core';

import { ExamResult } from '../models/exam-result.model';

const STORAGE_KEY = '1c-preparing.exam-history.v1';

/**
 * Persists finished exam attempt results to `localStorage` so a learner can see
 * their history of past attempts across sessions.
 */
@Injectable({ providedIn: 'root' })
export class ResultsHistoryService {
  saveResult(result: ExamResult): void {
    const history = this.getHistory();
    history.unshift(result);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage can fail (quota, private mode, SSR, etc). Not fatal for the app.
    }
  }

  getHistory(): ExamResult[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ExamResult[]) : [];
    } catch {
      return [];
    }
  }

  getHistoryForTopic(topicId: string): ExamResult[] {
    return this.getHistory().filter((r) => r.topicId === topicId);
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
