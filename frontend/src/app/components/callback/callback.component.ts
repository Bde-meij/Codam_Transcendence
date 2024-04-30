import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent {
	constructor(auth: AuthService, private router: Router) {
		console.log(window.location.search);
		// auth.sendCode(window.location.search);
		router.navigate(['/dashboard']);
	};
}
