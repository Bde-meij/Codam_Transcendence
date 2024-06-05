import { Component } from '@angular/core';
import { AsyncPipe, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-twofa',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.scss'
})
export class TwofaComponent {
  constructor(private http: HttpClient, private router: Router) {};
  
  userInput: string = "";
  verificationRes: {message: string, status: boolean} = {message: "", status: false};

  ngOnInit(): void {
    this.verificationRes.message = "";
  }

  verifyUserInput() {
    this.http.post<any>('/api/auth/2faverify', { userInput: this.userInput }).subscribe(response => {
      this.verificationRes = response;
      console.log('Verification response:', response.message);
      if (this.verificationRes.status)
        this.router.navigate(['/dashboard/home']);
    }, error => {
      console.error('Error verifying user input:', error);
    });
  }

  cancel() {
    this.http.post('api/auth/logout', {}).subscribe();
    this.router.navigate(['/welcome']);
  }
}