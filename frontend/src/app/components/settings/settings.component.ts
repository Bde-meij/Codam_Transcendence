import { Component } from '@angular/core';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(private http: HttpClient, private authService: AuthService) {};

  isChecked: boolean = false;
  is2faEnabled: boolean = false;
  qrCode: string = "";
  secret: string = "";
  userInput: string = "";
  verificationRes: string = "";

  ngOnInit(): void {
	this.authService.is2FAEnabled().subscribe(data => {
		this.is2faEnabled = data.isTwoFAEnabled;
	})
  }

  onChange() {
    if (this.is2faEnabled) {
		this.isChecked = true;
		this.authService.setUp2FA().subscribe( data => {
			this.qrCode = data.qrCode;
			this.secret = data.secret;
		});
    }
    else {
		this.isChecked = false;
		this.authService.disable2FA().subscribe();
    }
  }

  verifyUserInput() {
		this.authService.verify2FA(this.userInput).subscribe({
			next: (response) => {
				this.verificationRes = response.message;
				console.log('Verification response:', response);
			},
			error: (e) => { 
				console.error('Error verifying user input:', e);
			}
		});
  	}
}