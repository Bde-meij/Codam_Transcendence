import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';
import { User } from '../../models/user.class';
// import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	// private authClient: Auth0Client | undefined;

	// constructor() {
	// 	this.initializeAuth0();
	// };

	// async initializeAuth0() {
	// 	this.authClient = await createAuth0Client({
	// 		domain: 'http://api.intra.42.fr/v2/oauth',
	// 		clientId: 'u-s4t2ud-7ae181090888396e717cc9cdec0e0ff9a312c655e22ea37b1cc2e426536847cb',
	// 		authorizationParams: {
	// 			redirect_uri: window.location.origin,
	// 			scope: 'public'
	// 		}
	// 	});
	// }

	// public async login() {
	// 	if (this.authClient) {
	// 		await this.authClient.loginWithRedirect();
	// 	} else {
	// 		this.initializeAuth0();
	// 	}
	// }

}
