import { NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbDialogRef } from '@nebular/theme';
import { Observable, catchError, map, of } from 'rxjs';
import { UserService } from '../../../services/user/user.service';
import { ChatService } from '../../../services/sock/chat/chat.service';
import { Rooms } from '../../../models/rooms.class';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-createChatRoom',
  standalone: true,
  imports: [NbCardModule, NgFor, NgIf, FormsModule],
  templateUrl: './createChatRoom.component.html',
  styleUrl: './createChatRoom.component.scss'
})
export class createChatRoom {

  roomName: string = '';
  password: string = '';
  withPassword: boolean = false;
  submitWithoutName: boolean = false;
  nameAlreadyInUse: boolean = false;
  roomType: string = 'public';
  users: number[] = [];
  usersByName: string[] = [];
  currentUsername!: string;
  roomslist: Record<string, Rooms> = {};
  userToAddName: string = '';
  userToAddId: number = 0;
  userNotFound: boolean = false;
  userInRoom: boolean = false;
  roomsList: Record<string, Rooms> = {};

	constructor(protected dialogRef: NbDialogRef<createChatRoom>, private userService: UserService) {
      	this.usersByName.push(this.currentUsername)
  	}

  	submitForm() {
    if (!this.withPassword)
    	this.password = '';
    if (this.roomName)
    {
    	if (this.roomName in this.roomsList)
    		this.nameAlreadyInUse = true;
      	else
    	    this.dialogRef.close({roomName: this.roomName, password: this.password, roomType: this.roomType, users: this.users});
    }
    else
     	this.submitWithoutName = true;
  	}

  	onTypeChange(event: any) {
    this.roomType = event.target.value;
    if (this.roomType !== 'public')
    	this.withPassword = true;
  	}

  	addUser() {
		if (this.userToAddName === this.currentUsername) {
			this.userInRoom = true;
			this.userNotFound = false;
			return;
		}
		this.getSelectedUserId().subscribe((userExists) => {
			if (!userExists) {
				this.userNotFound = true;
				this.userInRoom = false;
				return;
			}
			this.userNotFound = false;
			if (this.users.includes(this.userToAddId)) {
				this.userInRoom = true;
				return;
			}
			this.userInRoom = false;
			this.users.push(this.userToAddId);
		})
  	}

	private getSelectedUserId(): Observable<boolean> {
		return this.userService.getUserIdByName(this.userToAddName).pipe(
			map((data: any) => {
				this.userToAddId = +data;
				return true;
			}),
			catchError((error) => {
				console.error('Error fetching user ID:', error);
				return of(false);
			})
		);
	}
}