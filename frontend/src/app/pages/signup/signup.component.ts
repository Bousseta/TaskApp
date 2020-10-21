import { Component, OnInit } from '@angular/core';
import {HttpResponse} from "@angular/common/http";
import {AuthService} from "../../auth.service";
import {Router, Routes} from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor(private authService: AuthService, private router:Router) { }

  ngOnInit() {
  }
  onSignup(email: string, password: string) {
    this.authService.signup(email, password).subscribe((res: HttpResponse<any>) => {
      if (res.status === 200) {
        // we have logged in successfully
        this.router.navigate(['/login']);
      }
      console.log(res);

    });
  }
}
