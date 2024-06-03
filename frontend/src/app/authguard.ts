import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth/auth.service";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable ({
	providedIn: 'root'
})
export class AuthGuard{
	constructor(private router: Router, private authService: AuthService) {}

	canActivate(): boolean {
		if (this.authService.getLogStatus()) {
			return true;
		} else {
			// this.router.navigate(['/welcome']);
			return true;
		}
	}
}