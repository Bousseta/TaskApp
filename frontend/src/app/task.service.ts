import { Injectable } from '@angular/core';
import {WebRequestService} from "./web-request.service";
import {Task} from "./../app/models/task.model"
@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private WebRequestService : WebRequestService) { }
  createList(title: string){
    //to send a web request to create a list
    return this.WebRequestService.post('lists',{title});
  }
  createTask(title: string, listId: string){
    //to send a web request to create a list
    return this.WebRequestService.post(`lists/${listId}/tasks`,{title});
  }
  getLists(){
    return this.WebRequestService.get('lists');
  }
  getListsFromPage(numPage: number){
    return this.WebRequestService.get(`list/${numPage}`);

  }
  getTasks(listId: string,numPage: string) {
    return this.WebRequestService.get(`lists/${listId}/tasks/${numPage}`);

  }
  updateList(id: string, title: string) {
    // We want to send a web request to update a list
    return this.WebRequestService.patch(`lists/${id}`, { title });
  }

  updateTask(listId: string, taskId: string, title: string) {
    // We want to send a web request to update a list
    return this.WebRequestService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }

  deleteTask(listId: string, taskId: string) {
    return this.WebRequestService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  deleteList(id: string) {
    return this.WebRequestService.delete(`lists/${id}`);
  }

  complete(task: Task) {
    return this.WebRequestService.patch(`lists/${task._listId}/tasks/${task._id}`, {
      completed: !task.completed
    });
  }
}
