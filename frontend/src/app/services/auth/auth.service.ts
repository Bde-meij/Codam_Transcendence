
import { HttpClient } from '@angular/common/http';
import { Injectable, Input } from '@angular/core';
import auth0 from 'auth0-js';
import { AppComponent } from '../../app.component';
import { Observable } from 'rxjs';

// import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	// private auth: auth0.WebAuth;
	// private authApi = "/api/auth";
	// logstatus$ : Observable<boolean> | undefined;

	// constructor(private http: HttpClient) {
	// 	this.auth = new auth0.WebAuth({
	// 		domain: 'http://api.intra.42.fr/v2/oauth',
	// 		clientID: 'u-s4t2ud-7ae181090888396e717cc9cdec0e0ff9a312c655e22ea37b1cc2e426536847cb',
	// 		redirectUri: "http://localhost:4200/callback",
	// 		responseType: 'code',
	// 		scope: 'public',
	// 	})
	// };

	login() : void {
		console.log("authservice.login called");
		// this.http.post(this.authApi + '/login', { });
		// this.auth.authorize();
	};

	logout() : void {
		console.log("authservice.logout called");
		// this.http.post(this.authApi + '/logout', { });
	}	
	
	// sendCode(code: string) : void {
	// 	this.http.post(this.authApi + '/code', code);
	// }

	// make request to backend
	// getLogStatus() : Observable<boolean> {
	// 	return (this.http.get<boolean>(this.authApi, {}));
	// }

	getLogStatus() : boolean {
		return (true);
	}
}
