import { Component, OnChanges, OnInit } from '@angular/core';
// import { FAKE_FRIENDS, User } from '../../models/user.class';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FriendsService } from '../../services/friends/friends.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FriendRequest } from '../../models/friendrequest.class';

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
	incoming?: FriendRequest[];
	outgoing?: FriendRequest[];
	errorMessage?: string | undefined;

	ngOnInit() {
		this.getLists();
	}

	getLists() {
		this.friendsService.getFriends().subscribe({
			next: (data) => (
				this.friends = data,
				console.log("all friends: ", data)
			),
			error: (e) => (
				console.error("all friends error: " + e))
		});
		this.friendsService.getIncomingRequests().subscribe({
			next: (data) => (
				this.incoming = data,
				console.log("all incoming: ", data)
			),
			error: (e) => (
				console.error("all incoming error: " + e))
		});
		this.friendsService.getOutgoingRequests().subscribe({
			next: (data) => (
				this.outgoing = data,
				console.log("all outgoing: ", data)
			),
			error: (e) => (
				console.error("all outgoing error: " + e))
		});
		this.errorMessage = undefined;
	}

	selectedFriend: Friend | undefined;
 
	selectFriend(friend: Friend) {
  		this.selectedFriend = friend;
	};

	selectedIncomingRequest: FriendRequest | undefined;

	selectIncomingRequest(request: FriendRequest) {
		this.selectedIncomingRequest = request;
	}

	selectedOutgoingRequest: FriendRequest | undefined;

	selectOutgoingRequest(request: FriendRequest) {
		this.selectedOutgoingRequest = request;
	}

	acceptIncoming(request: FriendRequest) {
		console.log("accept request: ", request);
		this.friendsService.acceptIncomingRequest(request.id).subscribe({
			next: (data) => {
				console.log("accept friendrequest data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("accept friendrequesterror: " + e.message)
			}
		});
		this.getLists();
	}

	deleteRequest(request: FriendRequest) {
		console.log("delete request: ", request);
		this.friendsService.deleteRequest(request.id).subscribe({
			next: (data) => {
				console.log("delete friendrequest data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("delete friendrequest error: " + e.message)
			}
		});
		this.getLists();
	}

	deleteFriend(friend: Friend) {
		console.log("delete friend: ", friend);
		this.selectedFriend = undefined;
		this.friendsService.deleteFriend(friend.id).subscribe({
			next: (data) => {
				console.log("delete friend data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("delete friend error: " + e.message)
			}
		});
		this.getLists();
	}

	deselectFriend() {
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
		this.getLists();
	}
}
