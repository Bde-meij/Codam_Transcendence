import { sequence } from '@angular/animations';
// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

export interface Positions {
	yPosP1: number;
	yPosP2: number;
}

@Injectable({
	providedIn: 'platform'
})
export class GameService {
	private gameApi : string = "/api/game";

	// constructor(private http: HttpClient) { };

	// update start position
	startKey(player: string, ypos: number) : Observable<any> {
		return (new Observable<any>)
		// return this.http.post<any>(this.gameApi + '/startkey/' + player + '/' + ypos.toString(), { });
	};

	upKey(player: string, amount: string) {
		return (new Observable<any>)
		// return this.http.post<any>(this.gameApi + '/upkey/' + player + '/' + amount, { });
	};
	downKey(player: string, amount: string) {
		return (new Observable<any>)
		// return this.http.post<any>(this.gameApi + '/downkey/' + player + '/' + amount, { });
	};

	sequenceSubscriber(observer: Observer<Positions>) {
		observer.next({
			yPosP1 : 1,
			yPosP2 : 1
		});
		observer.next({
			yPosP1 : 2,
			yPosP2 : 2
		});
		observer.next({
			yPosP1 : 4,
			yPosP2 : 4
		});
		observer.complete();
		return {unsubscribe() {}};
	};

	getPos() : Observable<Positions> {
		console.log(this.gameApi);
		// return this.http.get<Positions>(this.gameApi);
		let mysequence = new Observable(this.sequenceSubscriber);
		return mysequence;
	};
}
