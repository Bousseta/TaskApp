import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../task.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Task} from  "../../models/task.model";
import {List} from "../../models/list.model";
import {HttpClient} from "@angular/common/http";
@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  lists: List[];
  tasks: Task[];
  currentPage:number=1;
  pageSize:number=3;
  pages:Array<number>;
  selectedListId: string;
  selectedItem: string;

  constructor(private taskService: TaskService, private route: ActivatedRoute,private router: Router) { }

  ngOnInit() {
    this.onLoadLists();

  }
  private onLoadLists(){
    this.route.params.subscribe(
      (params: Params) => {
        if (params.listId) {
          this.selectedListId = params.listId;
          this.taskService.getTasks(params.listId,params.currentPage).subscribe((tasks: Task[]) => {
            this.tasks = tasks;
          })
        } else {
          this.tasks = undefined;
        }
      }
    )
    this.taskService.getListsFromPage(this.currentPage).subscribe((lists: any) => {
      this.lists = lists.docs;
      this.pages=Array(lists.pages);

    })
  }
  onTaskClick(task: Task) {
    // we want to set the task to completed
    this.taskService.complete(task).subscribe(() => {
      // the task has been set to completed successfully
      console.log("Completed successully!");
      task.completed = !task.completed;
    })
  }

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }

  onDeleteTaskClick(id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
      this.tasks = this.tasks.filter(val => val._id !== id);
      console.log(res);
    })
  }

  onPage(i:number){

    this.currentPage=i+1;
    this.onLoadLists();
  }
}
