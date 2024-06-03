import { Component } from '@angular/core';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(private http: HttpClient) {};

  isChecked: boolean = false;
  qrCode: string = "";
  secret: string = "";
  userInput: string = "";

  onChange() {
    if (this.isChecked) {
      this.http.get<any>("/api/auth/2fasetup").subscribe( data => {
        this.qrCode = data.qrCode;
        this.secret = data.secret;
    });
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