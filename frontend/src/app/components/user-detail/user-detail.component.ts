import { JsonPipe, NgIf, UpperCasePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';
import { FriendsService } from '../../services/friends/friends.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NbUserModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgIf, UpperCasePipe, JsonPipe, NbUserModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnChanges {
	@Input()id!: string;
	my_user?: User;

	tempUser = {
		id: '',
		nickname : '',
		avatar: '',
		status: ''
	};

	stats : undefined | {
		wins : undefined,
		losses : undefined,
		winrate: undefined,
		ranking: undefined
	};

	matches: any | undefined;

	isfriend?: boolean;
	isself?: boolean;
	errorMessage: string | undefined;
	userErrorMessage: string | undefined;

	constructor(private userService: UserService, private friendsService: FriendsService, private chatService: ChatService) {};

	ngOnChanges(): void {
		this.userErrorMessage = undefined;
		this.userService.getUser(this.id).subscribe({
			next: (data) => (
				this.tempUser.id = data.id,
				this.tempUser.nickname = data.nickname,
				this.tempUser.status = data.status
			),
			error: (error : HttpErrorResponse) => (
				console.log("user error message: ", error.message),
				this.userErrorMessage = error.message
			)
		})

		this.userService.getAvatar(this.id).subscribe((data) => (
			this.tempUser.avatar = URL.createObjectURL(data)
		))
		this.friendsService.isFriend(this.id).subscribe({
			next: (data) => {
				console.log("isFriend: ", data)
				this.isself = data.self,
				this.isfriend = data.friend
			}
		});
		this.my_user = this.tempUser;
		this.matches = undefined;
		this.stats = undefined;
	}

	getStats() {
		this.errorMessage = undefined;
		this.matches = undefined;
		this.userService.getStats(this.id).subscribe({
			next: (data) => (
				console.log('user-detail stat data:', data),
				this.stats = data
			),
			error: (e : HttpErrorResponse) => (
				this.errorMessage = e.message,
				console.log('user-detail stat error:', e)
			)
		});
	}

	getMatches() {
		this.errorMessage = undefined;
		this.stats = undefined;
		this.userService.getMatches(this.id).subscribe({
			next: (data) => (
				this.matches = data,
				console.log('user-detail match data:', data)
			),
			error: (e : HttpErrorResponse) => (
				this.errorMessage = e.message,
				console.log('user-detail match error:', e)
			)
		});
	}

	addFriend() {
		if (this.isfriend === undefined)
			return;
		this.friendsService.addFriendId(this.id).subscribe({
			next: (data) => {
				console.log("send friendrequest data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("send friendrequesterror: " + e.message)
			}
		});
		this.isfriend = undefined;
	}

	deleteFriend() {
		if (this.isfriend === undefined)
			return;
		this.friendsService.deleteFriend(this.id).subscribe({
			next: (data) => {
				console.log("delete friend data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("delete friend error: " + e.message)
			}
		});
		this.isfriend = undefined;
	}

	inviteChat(){
		if (this.my_user?.id != this.id)
		{
			this.chatService.inviteChat(this.id)
		}
	}
}
