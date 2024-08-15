import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient, HttpHandlerFn, HttpEventType } from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, switchMap, filter, take } from "rxjs/operators";
// import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	private isRefreshing = false;
  	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(
		// private snackBar: MatSnackBar, 
		private router: Router, private http: HttpClient) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const clonedReq = req.clone({
			withCredentials: true
		  });
		if (clonedReq.url.includes('/api/auth/refresh')) {
			return next.handle(clonedReq);
		}
		return next.handle(clonedReq).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error.status === 401) {
					return this.handleError(clonedReq, next);
				}
				return throwError(() => new Error(error.error.message));
			})
		)
	}

	private handleError(req: HttpRequest<any>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);
			return this.http.post<any>('/api/auth/refresh', {}, {withCredentials: true}).pipe(
				switchMap((token: any) => {
					// console.log("in switch map token:", token);
					this.isRefreshing = false;
					this.refreshTokenSubject.next(token);
					return next.handle(this.addToken(req, token.access_token))
				}),
				catchError(error => {
					this.isRefreshing = false;	
					// this.snackBar.open('Session expired, please login again', 'Login', {
					// 	duration: 5000,
					// 	horizontalPosition: 'center',
					// 	verticalPosition: 'top',
					// }).onAction().subscribe(() => {
					// 	this.router.navigate(['/welcome']);
					// });

					return throwError(() => new Error('Session expired'));
				})
			);
		}
		else {
			return this.refreshTokenSubject.pipe(
				filter(token => token != null),
				take(1),
				switchMap(token => {
					return next.handle(this.addToken(req, token.access_token));
				})
			)	
		}
	}

	private addToken(req: HttpRequest<any>, token: string) {
		return req.clone({
		  setHeaders: {
			Authorization: `Bearer ${token}`
		  }
		});
	  }
}