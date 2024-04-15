import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.class';
import { Observable } from 'rxjs';
// import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private authApi : string = "http://api:3000/api/auth";
	private httpOptions = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	};

	constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {};

	registerUser(newUser: User) {
		newUser.id;
		return this.http.post<User>(this.authApi + '/register', newUser);
	};
	loginUser(username: string, password: string): Observable<any> {
		return this.http.post(this.authApi + '/login', {username, password});
	};
	logoutUser(username: string, password: string): Observable<any> {
		return this.http.post(this.authApi + '/logout', {username, password});
	};

	logout(){
		return this.http.post(this.authApi + '/logout', { });
	}
	
	// log out User

	refreshToken() {
		return this.http.post(this.authApi + 'refreshtoken', { }, this.httpOptions);
	}

	// public isAuthenticated() : boolean {
	// 	if (isPlatformBrowser(this.platformId)) {
	// 		const token = localStorage.getItem('authToken');
	// 		const helper = new JwtHelperService();
	// 		const isExpired = helper.isTokenExpired(token);
	// 		return !isExpired;
	// 	}
	// };
}
