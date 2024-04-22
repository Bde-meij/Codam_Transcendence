import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { TestAuthService } from "./services/testauth/testauth.service";

@Injectable ({
	providedIn: 'root'
})
export class AuthGuard{
	constructor(private testauthService : TestAuthService, private router: Router) {}

	canActivate(): boolean {
		if (this.testauthService.isAuthenticated()) {
			return true;
		} else {
			this.router.navigate(['/welcome']);
			return false;
		}
	}
}