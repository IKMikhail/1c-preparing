import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'topics', pathMatch: 'full' },
  {
    path: 'topics',
    loadComponent: () =>
      import('./features/topics-list/topics-list.component').then((m) => m.TopicsListComponent),
  },
  {
    path: 'exam/:topicId',
    loadComponent: () =>
      import('./features/exam-runner/exam-runner.component').then((m) => m.ExamRunnerComponent),
  },
  {
    path: 'result',
    loadComponent: () => import('./features/result/result.component').then((m) => m.ResultComponent),
  },
  { path: '**', redirectTo: 'topics' },
];
