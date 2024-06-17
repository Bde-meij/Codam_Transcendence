import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-menu',
  standalone: true,
  imports: [],
  templateUrl: './game-menu.component.html',
  styleUrl: './game-menu.component.scss'
})
export class GameMenuComponent {
  // roomNum = 1;
    title = "1v1 PONG";
    constructor(private router: Router) {};

    startGame() {
      this.router.navigate(['/dashboard/game'])
    }
    
    inviteGame() {
      this.router.navigate(['/dashboard/game'])
    }
}
