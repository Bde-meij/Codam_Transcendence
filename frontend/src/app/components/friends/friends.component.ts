import { Component, OnInit } from '@angular/core';
// import { FAKE_FRIENDS, User } from '../../models/user.class';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FriendsService } from '../../services/friends/friends.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

export interface Friend {
	id: string;
	nickname: string;
}

export const FAKE_FRIENDS: Friend[] = [
	{ id: "12", nickname: 'Dr. Nice' },
	{ id: "13", nickname: 'Bombasto'},
	{ id: "14", nickname: 'Celeritas'},
	{ id: "15", nickname: 'Magneta'},
	{ id: "16", nickname: 'RubberMan'},
	{ id: "17", nickname: 'Dynama'},
	{ id: "18", nickname: 'Dr. IQ'},
	{ id: "19", nickname: 'Magma'},
	{ id: "20", nickname: 'Tornado'}
];

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, UpperCasePipe, UserDetailComponent, RouterLink],
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
		// this.friends= FAKE_FRIENDS;
		this.friendsService.getFriends().subscribe({
			next: (data) => (
				this.friends = data,
				console.log("all friends: ", data)
			),
			error: (e) => (
				console.error("all friends error: " + e))
		});
	}

	selectedFriend?: Friend;

	onSelect(friend: Friend) {
  		this.selectedFriend = friend;
	};

	deselect() {
		this.selectedFriend = undefined;
	}

	sendRequest(): void {
		if (this.friendForm.value.friendName) {
			console.log("sending this name: ", this.friendForm.value.friendName);
			this.friendsService.addFriend(this.friendForm.value.friendName).subscribe({
				next: (data) => {
					console.log("send friendrequest data: " + data)
				},
				error: (e : HttpErrorResponse) => {
					this.errorMessage = e.message,
					console.log("send friendrequesterror: " + e.message)
				}
			});
		}
	}
}
