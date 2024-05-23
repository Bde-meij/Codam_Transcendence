import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	constructor(private userService: UserService, private router: Router) {};

	success = false;
	error = false;

	default_avatar: File = new File(["default_avatar"], "/assets/src/images/default_avatar.png");

	registration : UserInterface = {
		id: '',
		nickname: '',
		status: '',
		avatar: this.default_avatar,
	};

	fileToUpload: File | null = null;

	handleFileInput(event: any) {
		const files = event.target.files;
		if (files.length > 0) {
		  this.fileToUpload = files[0];
		} else {
		  this.fileToUpload = null;
		}
	}

	register() {
		// this.userService.registerUser(this.registration).subscribe(data => {console.log(data.error.message)});
		if (this.fileToUpload) {
			this.registration.avatar = this.fileToUpload;
		}
		this.userService.registerUser(this.registration).subscribe({
			next: (v) => {
				console.log(v), this.success = true,
				this.router.navigate(['/dashboard']);
			},
			error: (e : HttpErrorResponse) => {console.log(e.error.message), this.error=true},
			complete: () => console.info('complete') 
		});

		if (this.success) {
			console.log("success!");
		}
	};
}
