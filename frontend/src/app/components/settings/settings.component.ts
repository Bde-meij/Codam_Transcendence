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
  is2faEnabled: boolean = false;
  qrCode: string = "";
  secret: string = "";
  userInput: string = "";
  verificationRes: string = "";

  ngOnInit(): void {
    this.http.get<any>("/api/auth/is2faenabled").subscribe(data => {
      this.is2faEnabled = data.isTwoFAEnabled;
    })
  }

  onChange() {
    if (this.is2faEnabled) {
      this.isChecked = true;
      this.http.get<any>("/api/auth/2fasetup").subscribe( data => {
        this.qrCode = data.qrCode;
        this.secret = data.secret;
    });
    }
    else {
      this.isChecked = false;
      this.http.post<any>('/api/auth/2fadisable', {}).subscribe();
    }
  }

  verifyUserInput() {
    this.http.post<any>('/api/auth/2faverify', { userInput: this.userInput }).subscribe(response => {
      this.verificationRes = response.message;
      console.log('Verification response:', response);
    }, error => {
      console.error('Error verifying user input:', error);
    });
  }
}