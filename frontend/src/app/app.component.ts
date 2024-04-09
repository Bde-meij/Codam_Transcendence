import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Test, TestService } from './services/test.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  
  testValue : Test | undefined;

  showTest() {
    this.service.getTest()
      // clone the data object, using its known Config shape
      .subscribe(data => this.testValue = { ...data });
  }

  
  // testValue = this.service.getTest();

  constructor(private service: TestService) {this.showTest()}
}
