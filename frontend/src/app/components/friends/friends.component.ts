import { Component, OnInit } from '@angular/core';
// import { FAKE_FRIENDS, User } from '../../models/user.class';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FriendsService } from '../../services/friends/friends.service';

export interface Friend {
	id: string;
	nickname: string;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [NgFor, NgIf, UpperCasePipe, UserDetailComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit {
	constructor(private friendsService : FriendsService) {};

	friends?: Friend[];

	ngOnInit() {
		this.friendsService.getFriends().subscribe({
			next: (data) => (
				console.log("all friends: ", data)
			),
			error: (e) => (
				console.error(e))
		});
	}


	// friends = FAKE_FRIENDS;
	selectedFriend?: Friend;

	onSelect(friend: Friend): void {
  		this.selectedFriend = friend;
	};
}
