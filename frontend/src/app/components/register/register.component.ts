import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../models/user.class';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage, AsyncPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
	currentfile?: File;
	message = "";
	preview = "";
	
	avatarInfo?: Observable<any>;

	constructor(private userService: UserService, private router: Router) {};

	success = false;
	error = false;

	default_avatar: File = new File(["default_avatar"], "/assets/images/avatar_default.png");
	// filename = "/assets/src/images/default_avatar.png";
	filename = "";
	updated_avatar: File | undefined = this.default_avatar;

	registration : UserInterface = {
		id: '',
		nickname: '',
		status: '',
		avatar: new FormData,
	};

	ngOnInit(): void {
		// this.avatarInfo = this.userService.getAvatar();
	}

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


	selectFile(event: any) {
		this.message = '';
		this.preview = '';
		const	selectedFiles = event.target.files;
		if (selectedFiles) {
			const file: File | null = selectedFiles.item(0);

			if (file) {
				this.preview = '';
				this.currentfile = file;
			
				const reader = new FileReader();
				reader.onload = (e: any) => {
					console.log("e.target.result: ", e.target.result);
					this.preview = e.target.result;
				};

				reader.readAsDataURL(this.currentfile);
			}
		}
	};

	uploadFile() {
		if (this.currentfile) {
			this.userService.uploadAvatar(this.currentfile).subscribe({
				next: (event:any) => {
					if (event instanceof HttpResponse) {
						this.message = event.body.message;
						// this.avatarInfo = this.userService.getAvatar();
					}
				},
				error: (err: any) => {
					console.log(err);

					if (err.error && err.error.message) {
						this.message = err.error.message;
					} else {
						this.message = "could not upload the file!";
					}
				},
				complete: () => {
					this.currentfile = undefined;
				}
			});
		}
	}

	olduploadFile(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		let fileList: FileList | null = element.files;
		if (fileList) {
			console.log("FileUpload -> files", fileList);
			
			const reader = new FileReader();
			reader.onload = (e: any) => {
				console.log("e.target.result: ", e.target.result);
        		this.preview = e.target.result;
			};

			this.updated_avatar = fileList[0];
			reader.readAsDataURL(fileList[0]);
			console.log("updated avatar : ", this.updated_avatar);
		}
	};

	register() {
		// if (this.filename != "") {
			// this.registration.avatar = new File(["my_avatar"], this.filename);
		// }
		// const formData : FormData = new FormData();
	
		if (this.currentfile) {
			console.log("current file : ", this.currentfile);
			this.registration.avatar.append('file', this.currentfile);
		} else {
			this.registration.avatar.append('file', this.default_avatar);
		}
		// this.registration.avatar = formData;
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

}
