import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbCheckboxModule, NbDialogRef, NbToggleModule} from '@nebular/theme';
import { Rooms } from '../../../models/rooms.class';

@Component({
  selector: 'app-protectedChat',
  standalone: true,
  imports: [NbCardModule, NgFor, NgIf, FormsModule, NbCheckboxModule, NbToggleModule],
  templateUrl: './protectedChat.component.html',
  styleUrl: './protectedChat.component.scss'
})
export class protectedChat {
	roomName: string = '';
	Password: string = '';
	withPassword: boolean = false;
	submitWithoutName: boolean = false;
	roomType: string = '';
	
	selectedRoom?: Rooms;
	checked = false;
	constructor(protected dialogRef: NbDialogRef<protectedChat>) {}

	ngOnInit(): void {
		this.roomName = this.selectedRoom!.name;
	}
	
	submitForm() {
	if (this.roomName){
		this.dialogRef.close({roomid: this.selectedRoom!.id, password: this.Password, roomName: this.selectedRoom!.name});
	}else
		this.submitWithoutName = true;
	}
}