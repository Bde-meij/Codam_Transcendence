import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { UniqueNameValidator, forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	constructor(private userService: UserService, private router: Router, private nameValidator: UniqueNameValidator) {};

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

	register() {
		console.log("registered name: ", this.profileForm.value.nickname);
		if (this.profileForm.value.nickname) {
			this.userService.register(this.profileForm.value.nickname).subscribe({
				next: (data) => {
					console.log("registered name data: ", data),
					this.errorMessage = "",
					this.router.navigate(['/dashboard/home'])
				},
				error: (e : HttpErrorResponse) => {
					this.errorMessage = e.message,
					console.log("registered name error: ", e.message)
				}
			});
		}
	};

	submitForm() {
		alert("succesfully clicked the button good job");
		this.register();
	}
}
