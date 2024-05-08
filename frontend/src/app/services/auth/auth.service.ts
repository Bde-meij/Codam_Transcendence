import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private loggedin = false;
	private authUrL = "/api/auth";
	
	constructor(private http: HttpClient) { };

	register() : void {
		this.http.post(this.authUrL + '/register', { });
		console.log("authservice.register called");
	}

	login() : void {
		this.http.get(this.authUrL + '/login', { }).subscribe();
		console.log("authservice.login called");
		this.loggedin = true;
	};

	logout() : void {
		this.http.post(this.authUrL + '/logout', { });
		console.log("authservice.logout called");
		this.loggedin = false;
	}	
	
	getLogStatus() : boolean {
		return (this.loggedin);
	}
}
