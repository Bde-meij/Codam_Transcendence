import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.scss'
})
export class TwofaComponent {
  constructor(private authService: AuthService, private router: Router) {};
  
  userInput: string = "";
  verificationRes: {message: string, status: boolean} = {message: "", status: false};

  verifyUserInput() {
	this.authService.verify2FA(this.userInput).subscribe({
		next: (response: any) => {
			this.verificationRes = response;
			if (this.verificationRes.status)
				this.router.navigate(['/dashboard/home']);
		},
		error: (e: any) => {
			console.log('Error verifying user input in TwoFAComponent:', e);
		}
	});
  }

  cancel() {
	// this.authService.logout().subscribe();
    this.router.navigate(['/welcome']);
  }
}