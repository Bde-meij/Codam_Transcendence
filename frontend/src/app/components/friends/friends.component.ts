import { Component, OnInit } from '@angular/core';
// import { FAKE_FRIENDS, User } from '../../models/user.class';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FriendsService } from '../../services/friends/friends.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface Friend {
	id: string;
	nickname: string;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, UpperCasePipe, UserDetailComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit {
	friendForm = new FormGroup({
		friendName: new FormControl('', {
			validators: [
				Validators.required,
				forbiddenNameValidator(/gary/),
				forbiddenNameValidator(/Gary/),
			],
			updateOn: 'change',
		}),
	});

	constructor(private friendsService : FriendsService) {};

	friends?: Friend[];
	errorMessage?: string;

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

	sendRequest(): void {
		console.log(this.friendForm.value.friendName);
		if (this.friendForm.value.friendName) {
			this.friendsService.addFriend(this.friendForm.value.friendName).subscribe({
				next: (data) => {
					console.log(data)
				},
				error: (e : HttpErrorResponse) => {
					this.errorMessage = e.error.message,
					console.log(e.error.message)
				}
			});
		}
	}

	submitForm() {
		this.sendRequest();
	}
}
