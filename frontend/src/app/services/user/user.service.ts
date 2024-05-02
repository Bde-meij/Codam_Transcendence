import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user"
	constructor(private http: HttpClient) { }

	ngOnInit() {
		this.http.get<User>(this.userUrl, {});
	};
}
