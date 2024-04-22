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

	keyUp(player: string, amount: string) {
		return this.http.post<any>(this.gameApi + '/keyup/' + player + '/' + amount, { });
	};
	keyDown(player: string, amount: string) {
		return this.http.post<any>(this.gameApi + '/keydown/' + player + '/' + amount, { });
	};
	getPos() {
		console.log(this.gameApi);
		return this.http.get<Positions>(this.gameApi);
	}
}
