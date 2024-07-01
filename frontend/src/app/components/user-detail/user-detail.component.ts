import { NgIf, UpperCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgIf, UpperCasePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
	@Input()id!: string;
	my_user?: User;

	tempUser = {
		id: '',
		nickname : '',
		avatar: '',
		status: ''
	};

	constructor(private userService: UserService) {};

	ngOnInit(): void {
		this.userService.getUser(this.id).subscribe((data) => (
			this.tempUser.id = data.id,
			this.tempUser.nickname = data.nickname,
			// this.tempUser.avatar = data.avatar,
			this.tempUser.status = data.status
		));
		this.userService.getAvatar(this.id).subscribe((data) => (
			this.tempUser.avatar = URL.createObjectURL(data)
		))
		this.my_user = this.tempUser;
	}
}
