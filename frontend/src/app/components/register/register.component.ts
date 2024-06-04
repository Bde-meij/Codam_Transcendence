import { Component, Injectable, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, AsyncValidator} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, catchError, map, of } from 'rxjs';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const forbidden = nameRe.test(control.value);
		return forbidden ? {forbiddenName: {value: control.value}} : null;
	};
}

@Injectable({providedIn: 'root'})
export class UniqueNameValidator implements AsyncValidator {
	constructor(private authService: AuthService) {}

	validate(control: AbstractControl): Observable<ValidationErrors | null> {
		return this.authService.isNameTaken(control.value).pipe(
			map((isTaken) => (isTaken ? {uniqueName: true} : null)),
			catchError(() => of(null)),
		);
	}
}

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

	constructor(private authService: AuthService, private router: Router, private nameValidator: UniqueNameValidator) {};

	ngOnInit(): void {
	}

	register() {
		console.log(this.profileForm.value.nickname);
		if (this.profileForm.value.nickname) {
			this.authService.register(this.profileForm.value.nickname).subscribe({
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
