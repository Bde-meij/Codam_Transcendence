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

	createBlock(targetId : string) {
		return this.http.post(this.blockUrl + '/new-block/' + targetId, {targetId});
	}

	// returns bool or HttpErrorResponse
	isBlocked(userid: string){
		return this.http.get<any>(this.blockUrl + '/is-blocked/' + userid, {});
	}

	// returns 
	removeBlock(userid: string){
		return this.http.delete<any>(this.blockUrl + '/delete-block-user/' + userid, {});
	}
}
