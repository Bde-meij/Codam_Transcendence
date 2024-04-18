import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
	providedIn: 'root'
})
export class GameService {
	private gameApi : string = "/api/game";

	constructor(private http: HttpClient) { };

	keyUp(amount: number) {
		return this.http.post<number>(this.gameApi + '/keyup', amount);
	};
	keyDown(amount: number) {
		return this.http.post<number>(this.gameApi + '/keydown', amount);
	};
}
