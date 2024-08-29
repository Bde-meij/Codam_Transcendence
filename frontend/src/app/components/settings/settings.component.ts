import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UniqueNameValidator, forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { UserService } from '../../services/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { Blocks } from '../../models/blocks.class';
import { BlockService } from '../../services/block/block.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, FormsModule, UserDetailComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
	constructor(
		private authService: AuthService, 
		private userService: UserService, 
		private blockService: BlockService,
		private nameValidator: UniqueNameValidator
	) {};

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

	errorMessage = "";
	succesMessage = "";
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
		this.authService.is2FAEnabled().subscribe((data : any) =>
			this.is2faEnabled = data.isTwoFAEnabled
		);
		this.userService.getUser('current').subscribe({
			next: (data : any) => {
				this.current_user_id = data.id
				this.current_nickname = data.nickname
			},
			error: (e : HttpErrorResponse ) => (
				console.log("the e: ", e)
			)
		});
		this.getBlockList();
	}

	blocklist : Blocks[] | undefined;
	getBlockList() {
		this.blockService.getBlocked().subscribe({
			next: (data : any) => {
				this.blocklist = data
			},
			error: (e : HttpErrorResponse ) => (
				console.log("block error: ", e)
			)
		})
	}

	reload() {
		window.location.reload();
	}

	onChange() {
		if (this.is2faEnabled) {
			this.isChecked = true;
			this.authService.setUp2FA().subscribe({
				next: (data: any) => {
					this.qrCode = data.qrCode;
					this.secret = data.secret;
				},
				error: (e: any) => (
					console.log("2FA setup error: ", e)
				)
			})
		}
		else {
			this.isChecked = false;
			this.authService.disable2FA().subscribe();
		}
	}

	verifyUserInput() {
		this.authService.verify2FA(this.userInput).subscribe({
			next: (response : any) => {
				this.verificationRes = response.message;
				console.log('Verification response:', response);
			},
			error: (e : HttpErrorResponse) => { 
				console.log('Error verifying user input:', e);
			}
		});
	}

	changeName() {
		console.log(this.profileForm.value.nickname);
		if (this.profileForm.value.nickname) {
			let new_nick = this.profileForm.value.nickname;
			this.userService.changeName(this.profileForm.value.nickname).subscribe({
				next: (data : any) => {
					this.current_nickname = new_nick;
					console.log("changename data:", data);
					this.succesMessage = data.message;
					this.errorMessage = '';
				},
				error: (e: HttpErrorResponse) => {
					this.errorMessage = e.message;
					console.log("changename data error :", e.message);
				}
			});
			this.profileForm.value.nickname = undefined;
		};
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
					this.preview = e.target.result;
				};
				reader.readAsDataURL(this.current_file);
			}
		}
	};

	changeAvatar() {
		if (this.current_file) {
			this.userService.uploadAvatar(this.current_file).subscribe({
				next: (data : any) => {
					console.log("change avatar data:", data);
					this.succesMessage = data.message;
					this.errorMessage = '';
				},
				error: (e: HttpErrorResponse) => {
					this.errorMessage = e.message;
					console.log("change avatar data error :", e.message);
				}
			});
			this.preview = undefined;
		}
	}
}
