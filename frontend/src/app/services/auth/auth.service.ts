
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebAuth } from 'auth0-js';

// import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private auth: WebAuth;
	private authApi = "/api/auth";

	constructor(private http: HttpClient) {
		this.auth = new WebAuth({
			domain: 'http://api.intra.42.fr/v2/oauth',
			clientID: 'u-s4t2ud-7ae181090888396e717cc9cdec0e0ff9a312c655e22ea37b1cc2e426536847cb',
			redirectUri: "http://localhost:4200/callback",
			responseType: 'code',
			scope: 'public',
		})
	};

	login() : void {
		this.auth.authorize();
	};
	
	sendCode(code: string) : void {
		this.http.post(this.authApi + '/code', code);
	}
}
