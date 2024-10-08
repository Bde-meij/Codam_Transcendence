import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth/auth.service";
import { Observable, of } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable ({
	providedIn: 'root'
})
export class AuthGuard{
	constructor(private router: Router, private authService: AuthService) {}

	isLoggedIn: boolean = false;

	canActivate(): Observable<boolean> {
		return this.authService.getLogStatus().pipe(
			map((data: any) => {
				if (data.loggedIn) {
				return true;
				} else {
				this.router.navigate(['/welcome']);
				return false;
				}
			}),
			catchError((error : HttpErrorResponse) => {
				this.handleError(error);
				this.router.navigate(['/welcome']);
				return of(false);
			})
		);
	  }

	private handleError(error: HttpErrorResponse): void{
		console.log('AuthGuard nauthorized exception |', error, '|');
	}
}
