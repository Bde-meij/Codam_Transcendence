import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-game-menu',
  standalone: true,
  imports: [],
  templateUrl: './game-menu.component.html',
  styleUrl: './game-menu.component.scss'
})
export class GameMenuComponent {
    title = "1v1 PONG";
    constructor(private router: Router, private userService: UserService) {};

    pongGame() {
      this.router.navigate(['/dashboard/game'])
    }
    
    flappyGame() {
      this.userService.updateRoomKey(-1).subscribe();
      this.router.navigate(['/dashboard/game'])
    }
}

