import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbCheckboxModule, NbDialogRef, NbToggleModule} from '@nebular/theme';
import { Rooms } from '../../../models/rooms.class';

@Component({
  selector: 'app-settingsChat',
  standalone: true,
  imports: [NbCardModule, NgFor, NgIf, FormsModule, NbCheckboxModule, NbToggleModule],
  templateUrl: './settingsChat.component.html',
  styleUrl: './settingsChat.component.scss'
})
export class settingsChat{
	roomName: string = '';
	oldPassword: string = '';
	newPassword: string = '';
	withPassword: boolean = false;
	submitWithoutName: boolean = false;
	roomType: string = '';
	users: { user: string; username: string }[] = [];
	selectedRoom?: Rooms;
	checked = false;
	admins: number[] = [];
	adminsNames: string[] = [];
	god: string = 'No Owner';

	constructor(protected dialogRef: NbDialogRef<settingsChat>) {}
	
	ngOnInit(): void {
		this.roomName = this.selectedRoom!.name;
		this.admins = this.selectedRoom!.admins
		this.roomType = this.selectedRoom!.status;
		//console.log(this.selectedRoom?.owner.toString());
		for (const a of this.admins){
			for (const b of this.users){
				if (b.user == a.toString()){
					this.adminsNames.push(b.username);
				}
				if(b.user === this.selectedRoom?.owner.toString())
					this.god = b.username;
			}
		} 
		for (const b of this.users){
			if (b.user === this.selectedRoom?.owner.toString())
				this.god = b.username;
		}
	}
	
	isAdmin(userid: string){
		if (this.selectedRoom!.admins.includes(Number(userid)))
			return true;
		return false;
	}

	isGod(userid: string){
		return (this.selectedRoom!.owner == userid);
	}

	toggle(checked: boolean, user: string, username: string) {
		// console.log(this.users);
		this.checked = checked;
		if (this.checked == false){
			this.admins = this.admins.filter(adminId => adminId !== Number(user));
			this.adminsNames = this.adminsNames.filter(adminId => adminId !== username);
		}else {
			if (!this.admins.includes(Number(user))){
				this.admins.push(Number(user));
				this.adminsNames.push(username);
			}
		}
	}

	submitForm() {
	if (!this.withPassword)
		this.oldPassword = '';
	if (!this.roomType)
		this.roomType = "public";
	if (this.roomName){
		this.dialogRef.close({roomName: this.roomName, oldPassword: this.oldPassword, newPassword: this.newPassword, roomType: this.selectedRoom?.status, admins: this.admins});
	} else
		this.submitWithoutName = true;
	}
}