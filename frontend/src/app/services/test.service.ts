import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

export interface Test {
  id: number,
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
}
