import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Friend } from '../../components/friends/friends.component';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
	private friendsUrl = '/api/friends';

	constructor(private http: HttpClient) {};

	getFriends() {
		return this.http.get<Friend[]>(this.friendsUrl + '/all', {});
	}

	getIncomingRequests() {
		return this.http.get<any>(this.friendsUrl + '/incoming', {});
	}

	getOutgoingRequests() {
		return this.http.get<any>(this.friendsUrl + '/outgoing', {});
	}

	addFriend(nickname: string) {
		return this.http.post<any>(this.friendsUrl + '/new-request-nick/' + nickname, {});
	}
}
