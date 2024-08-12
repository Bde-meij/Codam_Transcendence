import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbDialogRef } from '@nebular/theme';

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
  roomType: string = '';
  users?: string[];

  constructor(protected dialogRef: NbDialogRef<createChatRoom>) {}

  submitForm() {
    if (!this.withPassword)
      this.password = '';
    if (this.roomName){
		console.log("roomtype:" , this.roomType);
      this.dialogRef.close({roomName: this.roomName, password: this.password, roomType: this.roomType});
	}
    else
      this.submitWithoutName = true;
  }
}