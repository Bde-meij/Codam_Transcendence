import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UniqueNameValidator, forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgOptimizedImage, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
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

	newName : string = '';
	errorMessage = "";

	constructor(private userService: UserService, private router: Router, private nameValidator: UniqueNameValidator) {};

	ngOnInit(): void {
	}

	register() {
		console.log(this.profileForm.value.nickname);
		if (this.profileForm.value.nickname) {
			this.userService.register(this.profileForm.value.nickname).subscribe({
				next: (data) => {
					console.log(data),
					this.router.navigate(['/dashboard/home']);
				},
				error: (e : HttpErrorResponse) => {
					this.errorMessage = e.error.message,
					console.log(e.error.message)
				},
				complete: () => console.info('complete') 
			});
		}
	};

	submitForm() {
		alert("succesfully clicked the button good job");
		this.register();
	}
}
