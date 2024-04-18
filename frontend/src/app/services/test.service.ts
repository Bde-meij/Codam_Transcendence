import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Test {
  id: number,
  name: string,
  password: string,
}

export interface Auth {
  name: string,
  password: string,
}

@Injectable({
  providedIn: 'root',
})
export class TestService {



  constructor(private http: HttpClient) { };

  getTest() {
    return this.http.get<Test>('http://api:3000/api/auth');
  }

  sendTest(newTest: Auth) {
    return this.http.post<Auth>('http://api:3000/api/auth', {name: newTest.name, password: newTest.password});
  }
}
