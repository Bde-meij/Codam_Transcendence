import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.class';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [UserDetailComponent, AsyncPipe, UpperCasePipe, FormsModule, NgIf, RouterLink],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
	my_id?: string;

	constructor(private userService: UserService){}

	ngOnInit(): void {
		this.userService.getUser('current').subscribe(data => 
			this.my_id = data.id
		);		
	};
}
