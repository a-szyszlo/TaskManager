import { Component, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { TaskService, Task } from '../services/task.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,         
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './task.html',
  styleUrls: ['./task.scss'] 
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterControl = new FormControl('');
  isLoading = false;

  newTaskTitle = new FormControl('');
  newTaskDescription = new FormControl('');

  editingTaskId: number | null = null;

  ngOnInit(): void {
    this.loadTasks();

    this.filterControl.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      this.filterTasks(value ?? '');
    });
  }
  
  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.filteredTasks = [...tasks];
      this.isLoading = false;
    });
  }
  
  filterTasks(filter: string) {
    this.isLoading = true;
    setTimeout(() => {
      const lowerFilter = filter?.toLowerCase() || '';
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(lowerFilter) ||
        task.description.toLowerCase().includes(lowerFilter)
      );
      this.isLoading = false;
    }, 500);
  }

  addTask() {
  if (!this.newTaskTitle.value) return;

  const newTask: Omit<Task, 'id'> = {
    title: this.newTaskTitle.value,
    description: this.newTaskDescription.value || '',
    completed: false
  };

  this.taskService.addTask(newTask).subscribe(createdTask => {
    this.tasks.push(createdTask);
    this.filterTasks(this.filterControl.value ?? '');
    this.newTaskTitle.reset();
    this.newTaskDescription.reset();
  });
}

  startEdit(task: Task) {
    this.editingTaskId = task.id;
    this.newTaskTitle.setValue(task.title);
    this.newTaskDescription.setValue(task.description);
  }

  saveEdit() {
  if (this.editingTaskId === null) return;

  const task = this.tasks.find(t => t.id === this.editingTaskId);
  if (task) {
    task.title = this.newTaskTitle.value ?? '';
    task.description = this.newTaskDescription.value || '';

    this.taskService.updateTask(task).subscribe(updatedTask => {
      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index > -1) this.tasks[index] = updatedTask;

      this.filterTasks(this.filterControl.value ?? '');
      this.editingTaskId = null;
      this.newTaskTitle.reset();
      this.newTaskDescription.reset();
    });
  }
}

  cancelEdit() {
    this.editingTaskId = null;
    this.newTaskTitle.reset();
    this.newTaskDescription.reset();
  }

  deleteTask(task: Task) {
  this.taskService.deleteTask(task.id).subscribe(() => {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.filterTasks(this.filterControl.value ?? '');
  });
}
}
