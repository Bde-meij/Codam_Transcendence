import { Component } from '@angular/core';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.scss'
})
export class TwofaComponent {
  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {};
  
  userInput: string = "";
  verificationRes: {message: string, status: boolean} = {message: "", status: false};

  verifyUserInput() {
	this.authService.verify2FA(this.userInput).subscribe({
		next: (response) => {
			this.verificationRes = response;
			// console.log('Verification response:', response.message);
			if (this.verificationRes.status)
				this.router.navigate(['/dashboard/home']);
		},
		error: (e) => {
			console.error('Error verifying user input:', e);
		}
	});
  }

  cancel() {
	this.authService.logout().subscribe();
    this.router.navigate(['/welcome']);
  }
}