import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../models/user.class';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	constructor(private userService: UserService, private router: Router) {};

	success = false;
	error = false;

	default_avatar: File = new File(["default_avatar"], "/assets/images/avatar_default.png");
	// filename = "/assets/src/images/default_avatar.png";
	filename = "";
	updated_avatar: File | undefined;

	registration : UserInterface = {
		id: '',
		nickname: '',
		status: '',
		avatar: this.default_avatar,
	};

	register() {
		// if (this.filename != "") {
		// 	this.registration.avatar = new File(["my_avatar"], this.filename);
		// }
		// this.userService.registerUser(this.registration).subscribe(data => {console.log(data.error.message)});
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

	// form = new FormGroup({
	// 	title: new FormControl(""),
	// 	image: new FormControl(null)
	// });

	// newFile(event: Event) {
	// 	// if (event != null) {
	// 	// 	const file = (event.target as HTMLInputElement).files[0];
	// 	// 	this.form.patchValue({ image: file});
	// 	// }
	// 	if (event ) {
	// 		// let myNewFile = (event.target as HTMLInputElement).files[0];
	// 		let mysecond = event.target?.addEventListener;
	// 		if (mysecond) {
	// 			this.registration.avatar = (mysecond as HTMLInputElement)?.files[0];
	// 		}
	// 	} else if (this.filename != "") {
	// 		this.registration.avatar = new File(["avatar_" + this.registration.nickname], this.filename);
	// 	}
	// };

	uploadFile(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList) {
			console.log("FileUpload -> files", fileList);
			this.updated_avatar = fileList[0];
		}
	};
}
