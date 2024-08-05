import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbDialogRef} from '@nebular/theme';
import { Rooms } from '../../../models/rooms.class';
import { ChatService } from '../../../services/sock/chat/chat.service';

@Component({
  selector: 'app-settingsChat',
  standalone: true,
  imports: [NbCardModule, NgFor, NgIf, FormsModule],
  templateUrl: './settingsChat.component.html',
  styleUrl: './settingsChat.component.scss'
})
export class settingsChat {
	roomName: string = '';
	password: string = '';
	withPassword: boolean = false;
	submitWithoutName: boolean = false;
	roomType: string = '';
	users?: string[];
	selectedRoom?: Rooms
	constructor(protected dialogRef: NbDialogRef<settingsChat>, private chatService: ChatService) {}

	ngOnInit(): void {
		this.selectedRoom = this.chatService.room;
		this.roomName = this.selectedRoom!.name;
	  }

	submitForm() {
	if (!this.withPassword)
		this.password = '';
	if (!this.roomType)
		this.roomType = "public";
	if (this.roomName){
		this.dialogRef.close({roomName: this.roomName, password: this.password, roomType: this.roomType});
	}
	else
		this.submitWithoutName = true;
	}
}