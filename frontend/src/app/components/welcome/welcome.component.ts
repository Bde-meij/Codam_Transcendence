import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
}
