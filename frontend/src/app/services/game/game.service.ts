import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Positions {
	player_one_ypos: number;
	player_two_ypos: number;
}

@Injectable({
	providedIn: 'root'
})
export class GameService {
	private gameApi : string = "/api/game";

	constructor(private http: HttpClient) { };

	// newGame() {
	// 	return this.http.post<any>(this.gameApi + '/new', {});
	// };
	keyUp(amount: number) {
		return this.http.post<number>(this.gameApi + '/keyup', amount);
	};
	keyDown(amount: number) {
		return this.http.post<number>(this.gameApi + '/keydown', amount);
	};
	getPos() {
		return this.http.get<Positions>(this.gameApi + '/pos');
	}
}
