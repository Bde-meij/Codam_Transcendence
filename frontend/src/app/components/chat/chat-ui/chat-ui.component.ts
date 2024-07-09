import { NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NbChatModule } from '@nebular/theme';
import { ChatService } from '../../../services/sock/chat/chat.service';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user.class';
import { Rooms } from '../../../models/rooms.class';
import { NbThemeModule, NbLayoutModule} from '@nebular/theme';
import { UserDetailComponent } from '../../user-detail/user-detail.component';

@Component({
  selector: 'app-chat-ui',
  standalone: true,
  imports: [NbChatModule, NgFor, NbThemeModule, NbLayoutModule, UserDetailComponent],
  templateUrl: './chat-ui.component.html',
  styleUrl: './chat-ui.component.scss'
})
export class ChatUiComponentOld implements AfterViewInit{
	@ViewChild('messageContainer') messageContainer!: ElementRef;
	@ViewChild('messageInput') messageInput!: ElementRef;
	@Input() room: any;
	@Input() user!: User;
	selectedUser: any;
	selectedUserID?: string;
	message: string | undefined;

	constructor(private chatService: ChatService, private userService :UserService) {};

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message, this.room.name);
			this.messageInput.nativeElement.focus();
		}
		this.message = '';
		//console.log("room users: " + this.room.users);
		//console.log(this.room.users)

		////console.log("chat-message sendmessage: " + this.room.name);
	}
}
