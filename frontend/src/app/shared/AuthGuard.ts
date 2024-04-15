import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
// import { AuthService } from "../services/auth/auth.service";
import { AccountService } from "../services/account/account.service";


@Injectable ({
	providedIn: 'root'
})
export class AuthGuard{
	constructor(private accountservice : AccountService, private router: Router) {}

	canActivate(): boolean {
		if (this.accountservice.isLoggedIn()) {
			return true;
		} else {
			this.router.navigate(['/welcome']);
			return false;
		}
	}
}