import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { SignupComponent } from './pages/signup/signup.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import {WebReqInterceptor} from "./web-req.interceptor";
import {JwPaginationComponent} from "jw-angular-pagination";

@NgModule({
  declarations: [
    AppComponent,
    TaskViewComponent,
    LoginPageComponent,
    NewListComponent,
    NewTaskComponent,
    SignupComponent,
    EditTaskComponent,
    EditListComponent,
    JwPaginationComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: WebReqInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
