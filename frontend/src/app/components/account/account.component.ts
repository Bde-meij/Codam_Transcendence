import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { User, UserInterface } from '../../models/user.class';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [UserDetailComponent, AsyncPipe, UpperCasePipe, FormsModule, NgIf],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
	currentavatar?: File = new File(["default_avatar"], "/assets/images/avatar_default.png"); // default
	message = "";
	avatarInfo?: Observable<any>;

	constructor(private userService: UserService){}

	// user : UserInterface = {
	// 	id: '0',
	// 	nickname: 'Gary',
	// 	status: 'online',
	// 	avatar: new FormData,
	// };
	user ?: UserInterface;

	testuser : User = {
		id: 1,
		name: 'Gary',
	};

	// passuser : User = {
	// 	id : Number(this.user.id),
	// 	name: this.user.nickname,
	// }

	passuser?: User;


	ngOnInit() {
		this.userService.getUser().subscribe((userData) => (
			this.user = userData,
			this.passuser = {
				id: Number(this.user.id),
				name: this.user.nickname,
			})
		);
		// if (this.user)	{
		// 	this.passuser = {
		// 		id: Number(this.user.id),
		// 		name: this.user.nickname,
		// 	};
		// }

		// this.passuser.id = Number(this.user.id);


		this.avatarInfo = this.userService.getAvatar();
		// this.user.avatar.append('file', this.userService.getAvatar().subscribe());
	};
}
