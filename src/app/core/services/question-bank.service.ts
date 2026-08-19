import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import { Question } from '../models/question.model';
import { QuestionBankData, Topic } from '../models/topic.model';

/**
 * Loads the question bank (topics + questions) from the JSON asset at
 * `src/assets/data/questions.json`. See that folder's README for the data shape.
 */
@Injectable({ providedIn: 'root' })
export class QuestionBankService {
  private readonly http = inject(HttpClient);

  private readonly data$: Observable<QuestionBankData> = this.http
    .get<QuestionBankData>('assets/data/questions.json')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getTopics(): Observable<Topic[]> {
    return this.data$.pipe(map((d) => d.topics));
  }

  getTopic(topicId: string): Observable<Topic | undefined> {
    return this.data$.pipe(map((d) => d.topics.find((t) => t.id === topicId)));
  }

  getAllQuestions(): Observable<Question[]> {
    return this.data$.pipe(map((d) => d.questions));
  }

  /** Returns the topic's questions in the order given by `Topic.questionIds`. */
  getQuestionsForTopic(topicId: string): Observable<Question[]> {
    return this.data$.pipe(
      map((d) => {
        const topic = d.topics.find((t) => t.id === topicId);
        if (!topic) {
          return [];
        }
        const byId = new Map(d.questions.map((q) => [q.id, q] as const));
        return topic.questionIds.map((id) => byId.get(id)).filter((q): q is Question => !!q);
      }),
    );
  }
}
