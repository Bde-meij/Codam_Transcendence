import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.class';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [UserDetailComponent, AsyncPipe, UpperCasePipe, FormsModule, NgIf, RouterLink],
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
