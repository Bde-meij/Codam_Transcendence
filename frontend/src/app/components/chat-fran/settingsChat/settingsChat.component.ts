import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbCheckboxModule, NbDialogRef, NbToggleModule} from '@nebular/theme';
import { Rooms } from '../../../models/rooms.class';
import { ChatService } from '../../../services/sock/chat/chat.service';

@Component({
  selector: 'app-settingsChat',
  standalone: true,
  imports: [NbCardModule, NgFor, NgIf, FormsModule, NbCheckboxModule, NbToggleModule],
  templateUrl: './settingsChat.component.html',
  styleUrl: './settingsChat.component.scss'
})
export class settingsChat {
	roomName: string = '';
	oldPassword: string = '';
	newPassword: string = '';
	withPassword: boolean = false;
	submitWithoutName: boolean = false;
	roomType: string = '';

	selectedRoom?: Rooms;
	checked = false;
	admins: number[] = [];
	constructor(protected dialogRef: NbDialogRef<settingsChat>, private chatService: ChatService) {}

	ngOnInit(): void {
		this.selectedRoom = this.chatService.room;
		this.roomName = this.selectedRoom!.name;
		this.admins = this.selectedRoom!.admins;
	}
	
	isAdmin(userid: number){
		if (this.selectedRoom!.admins.includes(userid))
			return true;
		return false;
	}

	toggle(checked: boolean, user: number) {
		this.checked = checked;
		if (this.checked == false){
			this.admins = this.admins.filter(adminId => adminId !== user);
		} else {
			if (!this.admins.includes(user)){
				this.admins.push(user);
			}
		}
	}

	submitForm() {
	if (!this.withPassword)
		this.oldPassword = '';
	if (!this.roomType)
		this.roomType = "public";
	if (this.roomName){
		this.dialogRef.close({roomName: this.roomName, oldPassword: this.oldPassword, newPassword: this.newPassword, roomType: this.roomType, admins: this.admins});
	} else
		this.submitWithoutName = true;
	}
}