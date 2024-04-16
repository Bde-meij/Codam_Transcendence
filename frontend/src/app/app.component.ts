import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { User } from './models/user.class';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{

	title = 'frontend';

	// anotherUser: User | undefined;
	constructor(private authService: AuthService) {
		// authService.getTest().subscribe(data => console.log(data));
	};

	testUser: User | undefined;


	ngOnInit() {
		this.authService.getTest().subscribe(data => this.testUser = { ...data });
	} 

	// public myUser = new User(1, "blabla", "blabla@mail.nl");

	

}
