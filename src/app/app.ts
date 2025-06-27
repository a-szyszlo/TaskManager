import { Component } from '@angular/core';
import { TasksComponent } from './task/task';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TasksComponent],
  template: '<app-task></app-task>',
  styleUrls: ['./app.scss']  
})
export class App {
  protected title = 'task-manager';
}
