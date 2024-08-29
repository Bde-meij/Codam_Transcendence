import { JsonPipe, NgIf, UpperCasePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';
import { FriendsService } from '../../services/friends/friends.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NbUserModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';
import { Router } from '@angular/router';
import { BlockService } from '../../services/block/block.service';

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
	client_user!: User
	text: string = "Chat!"

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

	constructor(
		private userService: UserService, 
		private friendsService: FriendsService,
		private chatService: ChatService, 
		private blockService: BlockService,
		private router: Router)
	{
		this.userService.getUser('current').subscribe({
			next: (userData : any) => (
				this.client_user = userData
			),
			error: (error : HttpErrorResponse) => (
				console.log("user error message: ", error.message),
				this.userErrorMessage = error.message
			)
		});
	}

	ngOnChanges(): void {
		this.userErrorMessage = undefined;
		this.userService.getUser(this.id).subscribe({
			next: (data : any) => (
				this.tempUser.id = data.id,
				this.tempUser.nickname = data.nickname,
				this.tempUser.status = data.status
			),
			error: (error : HttpErrorResponse) => (
				console.log("user error message: ", error.message),
				this.userErrorMessage = error.message
			)
		});

		this.userService.getAvatar(this.id).subscribe({
			next: (data : any) => (
				this.tempUser.avatar = URL.createObjectURL(data)
			),
			error: (error : HttpErrorResponse) => (
				console.log("getAvatar error message: ", error.message),
				this.userErrorMessage = error.message
			)
		});
		
		this.friendsService.isFriend(this.id).subscribe({
			next: (data : any) => (
				// console.log("isFriend: ", data),
				this.isself = data.self,
				this.isfriend = data.friend
			),
			error: (error: HttpErrorResponse) => (
				console.log("friendService error message: ", error.message ),
				this.errorMessage = error.message
			)
		});
		this.my_user = this.tempUser;
		this.matches = undefined;
		this.stats = undefined;
	}

	getStats() {
		this.errorMessage = undefined;
		this.matches = undefined;
		this.userService.getStats(this.id).subscribe({
			next: (data : any) => (
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
			next: (data : any) => (
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
			next: (data : any) => {
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
			next: (data : any ) => {
				console.log("delete friend data: " + data)
			},
			error: (e : HttpErrorResponse) => {
				this.errorMessage = e.message,
				console.log("delete friend error: " + e.message)
			}
		});
		this.isfriend = undefined;
	}

	block() {
		console.log("block the mf 🪕");
		this.blockService.createBlock(this.id).subscribe({
			next: (data : any ) => {
				console.log("block data: " + data);
			},
			error: (e : HttpErrorResponse ) => {
				console.log("block error: " + e);
			}
		});
	}

	inviteChat(){
		if (this.my_user?.id != this.client_user.id)
		{
			this.chatService.inviteChat(this.id);
			setTimeout(() => {
				this.router.navigate(['/dashboard', 'franchat']);
			}, 400);
		}
	}

	routeProfile(){
		this.router.navigate(['/dashboard', "detail" ,	 this.id]);
	}
}
