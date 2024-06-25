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

	constructor(private userService: UserService) {};

	ngOnInit(): void {
		this.my_user = this.userDetails(this.id);
	}

	userDetails(tempID : string) : User {
		let tempUser: User = {
			id: '0',
			nickname : '',
			avatar: '',
			status: ''
		};

		this.userService.getUser(tempID).subscribe((data) => (
			tempUser.id = data.id,
			tempUser.nickname = data.nickname,
			tempUser.avatar = data.avatar,
			tempUser.status = data.status
		));
		this.userService.getAvatar().subscribe((data) => (
			tempUser.avatar = URL.createObjectURL(data)
		))
		
		console.log('user', tempUser);

		return tempUser;
	}
}
