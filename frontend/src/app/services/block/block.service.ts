import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class BlockService {
	private blockUrl = "/api/block";
	
	constructor(private http: HttpClient) {};

	// returns either Block[] or HttpErrorResponse
	getBlocked() {
		return this.http.get<any>(this.blockUrl + '/all-blocked', {});
	}

	// returns bool or HttpErrorResponse
	isBlocked(userid: number){
		return this.http.get<any>(this.blockUrl + '/is-blocked/' + userid.toString(), {});
	}

	// returns 
	removeBlock(userid: number){
		return this.http.delete<any>(this.blockUrl + '/delete-block-user/' + userid, {});
	}
}
