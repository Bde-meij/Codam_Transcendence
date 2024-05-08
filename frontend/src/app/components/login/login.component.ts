import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
	constructor(private router: Router, public auth: AuthService) {};

	login() : void {
		// this.auth.login();
		window.location.href = '/api/auth/login';
		// this.router.navigate(['/auth']);
		// this.router.navigate(['/dashboard']);
	}
	// login() : void {
		// window.location.href = 'http://localhost:3000/api/auth/login';
	// }
}
