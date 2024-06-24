import { NgIf, UpperCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [NgIf, UpperCasePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
	@Input() user?: User;
}
