import { Component } from '@angular/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
	constructor() {};

	login() : void {
		window.location.href = 'http://localhost:3000/api/auth/login';
	}
}
