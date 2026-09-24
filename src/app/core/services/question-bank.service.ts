import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, shareReplay, switchMap } from 'rxjs';

import { Question } from '../models/question.model';
import {
  QuestionBankData,
  QuestionBankIndex,
  QuestionBankSection,
  Topic,
} from '../models/topic.model';

const DATA_ROOT = 'assets/data/';

/**
 * Loads the question bank from the JSON assets in `src/assets/data/`: `index.json`
 * lists the section files, each holding one topic and its questions.
 * See that folder's README for the data shape.
 */
@Injectable({ providedIn: 'root' })
export class QuestionBankService {
  private readonly http = inject(HttpClient);

  private readonly data$: Observable<QuestionBankData> = this.http
    .get<QuestionBankIndex>(`${DATA_ROOT}index.json`)
    .pipe(
      switchMap((index) =>
        forkJoin(index.sections.map((path) => this.http.get<QuestionBankSection>(DATA_ROOT + path))),
      ),
      map((sections) => ({
        topics: sections.map((s) => s.topic),
        questions: sections.flatMap((s) => s.questions),
      })),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

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
