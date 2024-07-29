import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UniqueNameValidator, forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { UserService } from '../../services/user/user.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
	current_file: File | undefined;

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
		this.userService.getUser('current').subscribe({
			next: (data ) => {
				this.current_user_id = data.id
				this.current_nickname = data.nickname
			},
			error: (e) => (
				console.log("the e: ", e)
			)
		});
	}

	reload() {
		window.location.reload();
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

	preview: string | undefined;
	selectFile(event: any) {
		const	selectedFiles = event.target.files;
		if (selectedFiles) {
			const file: File | null = selectedFiles.item(0);

			if (file && file.size < 1 * 1024 * 1024) {
				this.preview = '';
				this.current_file = file;

				const reader = new FileReader();
				reader.onload = (e: any) => {
					// console.log("e.target.result: ", e.target.result);
					this.preview = e.target.result;
				};
				reader.readAsDataURL(this.current_file);
			}
		}
	};

	changeAvatar() {
		if (this.current_file) {
			this.userService.uploadAvatar(this.current_file).subscribe({
				next: (data) => {
					console.log("change avatar data:", data);
					this.succesMessage = data.message;
					this.errorMessage = '';
				},
				error: (e: HttpErrorResponse) => {
					this.errorMessage = e.message;
					console.log("change avatar data error :", e.message);
				}
			});
		}
	}
}
