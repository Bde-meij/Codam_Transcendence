import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestAuthService } from './services/testauth/testauth.service';
import { User } from './models/user.class';
import { AsyncPipe, JsonPipe, NgFor } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, NgFor, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
	users$:Observable<User[]> | undefined;
	title = "Gary's basement";

	constructor(private testauthService: TestAuthService) {
	};

	ngOnInit() {
		this.users$ = this.testauthService.getTest();
	};
}
