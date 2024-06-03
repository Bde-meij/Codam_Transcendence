import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.class';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TestFranComponent } from '../test-fran/test-fran.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [UserDetailComponent, AsyncPipe, UpperCasePipe, FormsModule, NgIf, TestFranComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
	// defaultAvatar = new File(["default_avatar"], "assets/images/avatar_default.png");
	// currentavatar?: File = new File(["default_avatar"], "assets/images/avatar_default.png"); // default
	message = "";
	avatarInfo?: Observable<Blob>;
	avatar?: string;
	user ?: User;
	passuser?: User;

	constructor(private userService: UserService){}

	ngOnInit(): void {

		this.userService.getUser().subscribe((userData) => (
			this.user = userData,
			this.passuser = {
				id: Number(this.user.id),
				nickname: this.user.nickname,
				avatar: '',
				status: this.user.status,
			})
		);
		// if (this.user)	{
		// 	this.passuser = {
		// 		id: Number(this.user.id),
		// 		nickname: this.user.nickname,
		// 	};
		// }
		this.avatarInfo = this.userService.getAvatar();
		this.avatarInfo.subscribe({
			next : (data) => {
				console.log("avatar:", this.avatar),
				this.avatar = URL.createObjectURL(data),
				console.log("avatar:", this.avatar)
			},
			error: (e : HttpErrorResponse) => {console.log(e.error.message)},
			complete: () => console.info('complete')
		})
		if (this.avatar && this.passuser) {
			this.passuser.avatar = this.avatar;
		}
	};
}

	// user : UserInterface = {
	// 	id: '0',
	// 	nickname: 'Gary',
	// 	status: 'online',
	// 	avatar: new FormData,
	// };
	// user ?: User;

	// testuser : User = {
	// 	id: 1,
	// 	nickname: 'Gary',
	// 	avatar: '',
	// 	status: '',
	// };

	// // passuser : User = {
	// 	id : Number(this.user.id),
	// 	name: this.user.nickname,
	// }

	// passuser?: User;

	// ngOnInit() {

	// 	// this.userService.getUser().subscribe((userData) => (
	// 	// 	this.user = userData,
	// 	// 	this.passuser = {
	// 	// 		id: Number(this.user.id),
	// 	// 		nickname: this.user.nickname,
	// 	// 		avatar: '',
	// 	// 		status: this.user.status,
	// 	// 	})
	// 	// );
	// 	// if (this.user)	{
	// 	// 	this.passuser = {
	// 	// 		id: Number(this.user.id),
	// 	// 		name: this.user.nickname,
	// 	// 	};
	// 	// }

	// 	// this.passuser.id = Number(this.user.id);


	// 	this.avatarInfo = this.userService.getAvatar();
	// 	this.avatarInfo.subscribe(data => {
	// 		console.log("info:", data);
	// 		this.avatar = URL.createObjectURL(data);
	// 	});

	
	// 	// if (this.avatar && this.passuser) {
	// 	// 	this.passuser.avatar = this.avatar;
	// 	// }
	// 	// this.user.avatar.append('file', this.userService.getAvatar().subscribe());
	// };

