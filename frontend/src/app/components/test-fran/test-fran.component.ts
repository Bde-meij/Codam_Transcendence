import { Component } from '@angular/core';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test-fran',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './test-fran.component.html',
  styleUrl: './test-fran.component.scss'
})
export class TestFranComponent {
  constructor(private http: HttpClient) {};

  twoFAEnabled: Observable<any> = this.http.get('/api/auth/is2faenabled');
  qrCode: string = "";
  secret: string = "";
  userInput: string = "";
  isChecked: boolean = false;

  ngOnInit(): void {
    this.twoFAEnabled.subscribe(data => {
      this.isChecked = data.isTwoFAEnabled;
    })
  }

  onChange() {
    if (this.isChecked) {
      this.http.get<any>('/api/auth/2fasetup').subscribe( data => {
        this.qrCode = data.qrCode;
        this.secret = data.secret;
      });
    }
    else {
      this.qrCode = '';
      this.secret = '';
      this.http.post('/api/auth/2fadisable', { }).subscribe();
    }
  }

  verifyUserInput() {
    this.http.post('/api/auth/2faverify', { userInput: this.userInput }).subscribe(response => {
      console.log('Verification response:', response);
    }, error => {
      console.error('Error verifying user input:', error);
    });
  }
}
