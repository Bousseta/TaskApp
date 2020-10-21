import { Component, OnInit } from '@angular/core';
import {TaskViewComponent} from "../task-view/task-view.component";
import {TaskService} from "../../task.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Task} from "../../models/task.model";

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {
  listId : string;
  constructor(private taskService: TaskService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.listId= params[('listId')];
        console.log(this.listId);
      }
    )
  }
  createTask(title: string){
    this.taskService.createTask(title,this.listId).subscribe((response : any) => {
      console.log(response);
      this.router.navigate(['/lists', this.listId]);
    });


  }

}
