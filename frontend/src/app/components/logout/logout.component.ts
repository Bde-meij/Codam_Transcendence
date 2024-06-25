import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
	constructor(private router: Router,public auth: AuthService) {};

	logout() : void {
		this.auth.logout().subscribe();
		this.router.navigate(['/welcome']);
	}
}
