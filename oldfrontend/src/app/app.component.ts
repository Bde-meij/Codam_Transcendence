import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { Test, TestService } from './services/test/test.service';
// import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AccountService } from './services/account/account.service';
import { AuthService } from './services/auth/auth.service';
import { EventBusService } from './services/EventBus/event-bus.service';



@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterLink, RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent {
	title = "Gary's basement";
	isLoggedIn = false;
	username?: string;

	eventBusSub?: Subscription;

	constructor(
		private accountService: AccountService,
		private authService: AuthService,
		private eventBusService: EventBusService
	) {};

	ngOnInit(): void {
		this.isLoggedIn = this.accountService.isLoggedIn();

		if (this.isLoggedIn) {
			const user = this.accountService.getUser();
			this.username = user.username;
		}

		this.eventBusSub = this.eventBusService.on('logout', () => {
			this.logout();
		})
	}

	logout(): void {
		this.authService.logout().subscribe({
			next: res => {
				console.log(res);
				this.accountService.clean();

				window.location.reload();
			},
			error: err => {
				console.log(err);
			}
		});
	}
//   testValue : Test | undefined;

//   showTest() {
//     this.service.getTest()
//       // clone the data object, using its known Config shape
//       .subscribe(data => this.testValue = { ...data });
//   }

  
  // testValue = this.service.getTest();

//   constructor(private service: TestService) {this.showTest()}
}
