import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private loggedin = false;
	private authUrL = "/api/auth";
	private hostname: string;
	
	constructor(private http: HttpClient) {
		this.hostname = window.location.hostname;
	};

	register(nickname : string) {
		console.log("authservice.register called");
		return this.http.post(this.authUrL + '/register', {nickname});
	}

	login() : void {
		this.http.get(this.authUrL + '/login', { }).subscribe();
		console.log("authservice.login called");
		this.loggedin = true;
	};

	logout() : void {
		this.http.post(this.authUrL + '/logout', { }).subscribe();
		console.log("authservice.logout called");
		this.loggedin = false;
	}	
	
	getLogStatus() : boolean {
		return (this.loggedin);
	}

	// isAuthenticated() : boolean {

	// }
}
