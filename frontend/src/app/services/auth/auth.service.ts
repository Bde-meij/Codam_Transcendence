import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private authUrL = "/api/auth";
	
	constructor(private http: HttpClient) {
	};

	login() : void {
		this.http.get(this.authUrL + '/login', { }).subscribe();
		console.log("authservice.login called");
	};

	logout() : void {
		this.http.post(this.authUrL + '/logout', { }).subscribe();
		console.log("authservice.logout called");
	}	
	
	getLogStatus() {
		return this.http.get<any>(this.authUrL + '/isloggedin', { });
	}

	is2FAEnabled() {
		return this.http.get<any>(this.authUrL + '/is2faenabled', {});
	}

	setUp2FA() {
		return this.http.get<any>(this.authUrL + '/2fasetup', {});
	}

	disable2FA() {
		return this.http.post<any>('/api/auth/2fadisable', {});
	}

	verify2FA(userInput : string) {
		return this.http.post<any>('/api/auth/2faverify', { userInput: userInput });
	}
}
