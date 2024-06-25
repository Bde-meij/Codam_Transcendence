import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
	private friendsUrl = '/api/friends';

	constructor(private http: HttpClient) {};

	getFriends() {
		return this.http.get<any>(this.friendsUrl + '/all', {});
	}
}
