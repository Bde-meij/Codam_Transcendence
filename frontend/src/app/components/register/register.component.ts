import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgOptimizedImage, AsyncPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
	profileForm = new FormGroup({
		nickname: new FormControl(''),
	});

	newName : string = '';
	errorMessage = "";

	constructor(private userService: UserService, private authService: AuthService, private router: Router) {};

	ngOnInit(): void {
		// this.avatarInfo = this.userService.getAvatar();
	}

	register() {
		console.log(this.newName);
		this.authService.register(this.newName).subscribe({
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
	};

	submitForm() {
		alert (
			this.profileForm.value.nickname
		);
	}
}
