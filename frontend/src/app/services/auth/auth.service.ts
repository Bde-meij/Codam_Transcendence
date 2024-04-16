import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
// import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	private authApi : string = "/api/auth";


	// private httpOptions = {
	// 	headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	// };

	constructor(private http: HttpClient) { 
	};

	getTest() {
		console.log("Statement");
		return this.http.get<User>(this.authApi);
	}

	// register(newUser: User) {
	// 	return this.http.post<User>(this.authApi + 'register', newUser, this.httpOptions);
	// };

	// getTest() {
	// 	return this.http.get<User>(this.authApi);
	// }

	public isAuthenticated() : boolean {
		// const token = localStorage.getItem('authToken');
		// const helper = new JwtHelperService();
		// const isExpired = helper.isTokenExpired(token);
		// return !isExpired;
		return true;
	};

}
