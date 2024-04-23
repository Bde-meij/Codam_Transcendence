import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Positions {
	yPosP1: number;
	yPosP2: number;
}

@Injectable({
	providedIn: 'root'
})
export class GameService {
	private gameApi : string = "/api/game";

	constructor(private http: HttpClient) { };

	// update start position
	startKey(player: string, ypos: number) {
		return this.http.post<any>(this.gameApi + '/startkey/' + player + '/' + ypos.toString(), { });
	};

	upKey(player: string, amount: string) {
		return this.http.post<any>(this.gameApi + '/upkey/' + player + '/' + amount, { });
	};
	downKey(player: string, amount: string) {
		return this.http.post<any>(this.gameApi + '/downkey/' + player + '/' + amount, { });
	};
	getPos() {
		console.log(this.gameApi);
		return this.http.get<Positions>(this.gameApi);
	}
}
