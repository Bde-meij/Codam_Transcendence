import { Component } from '@angular/core';
import { FAKE_FRIENDS, User } from '../../models/user.class';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [NgFor, NgIf, UpperCasePipe],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent {
	friends = FAKE_FRIENDS;

	selectedFriend?: User;

	onSelect(friend: User): void {
  		this.selectedFriend = friend;
	};


}
