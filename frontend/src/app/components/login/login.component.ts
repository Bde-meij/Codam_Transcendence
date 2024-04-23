import { Component } from '@angular/core';
// import { AuthService } from '@auth0/auth0-angular';

import auth0 from 'auth0-js';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

	// login() {
	// 	AuthService.login();
	// }

	// // with auth0-js :
	login() : void {
		const auth0WebAuth = new auth0.WebAuth({
			domain: 'http://api.intra.42.fr/v2/oauth',
			clientID: 'u-s4t2ud-7ae181090888396e717cc9cdec0e0ff9a312c655e22ea37b1cc2e426536847cb',
			redirectUri: window.location.origin,
			responseType: 'code',
			scope: 'public'  // Specify only the scopes you need
		});

		auth0WebAuth.authorize();
	}

	// // with @auth0-angular
	// constructor(public auth:AuthService) {
	// };

	// login(): void {
	// 	console.log("authservice.login() is called");
	// 	this.auth.loginWithRedirect(
	// 	);
	// }
	
}
