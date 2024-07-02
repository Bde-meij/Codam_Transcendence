import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UniqueNameValidator, forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { UserService } from '../../services/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, FormsModule, AsyncPipe, UserDetailComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
	constructor(private authService: AuthService, private userService: UserService, private nameValidator: UniqueNameValidator, private router: Router) {};

	profileForm = new FormGroup({
		nickname: new FormControl('', {
			validators: [
				Validators.required,
				forbiddenNameValidator(/gary/),
				forbiddenNameValidator(/Gary/),
			],
			asyncValidators: [
				this.nameValidator.validate.bind(this.nameValidator),
			],
			updateOn: 'change',
		}),
	});

	// newName : string = '';
	errorMessage = "";
	succesMessage = ""
	current_nickname : string | null | undefined;
	current_user_id : string | undefined;

	isChecked: boolean = false;
	is2faEnabled: boolean = false;
	qrCode: string = "";
	secret: string = "";
	userInput: string = "";
	verificationRes: string = "";

	ngOnInit(): void {
		this.authService.is2FAEnabled().subscribe(data =>
			this.is2faEnabled = data.isTwoFAEnabled
		);
		this.userService.getUser('0').subscribe({
			next: (data ) => {
				this.current_user_id = data.id
				this.current_nickname = data.nickname
			},
			error: (e) => (
				console.log("the e: ", e)
			)
		});
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

	changeName() {
		console.log(this.profileForm.value.nickname);
		if (this.profileForm.value.nickname) {
			this.current_nickname = this.profileForm.value.nickname;
			this.userService.changeName(this.profileForm.value.nickname).subscribe({
				next: (data) => {
					console.log("changename data:", data);
					this.succesMessage = data.message;
					this.errorMessage = '';
				},
				error: (e: HttpErrorResponse) => {
					this.errorMessage = e.message;
					// this.succesMessage = '';
					console.log("changename data error :", e.message);
				}
			});
			this.profileForm.value.nickname = undefined;
		};
		// window.location.reload();
		
		// this.router.navigate([this.router.url]);
		// this.router.navigate(['/dashboard/settings/'], {});
		console.log("NAVIGATE")
	}
}
