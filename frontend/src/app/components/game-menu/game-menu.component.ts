import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';

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
      this.userService.updateRoomKey(0).subscribe(
      {
        next: () =>
        {
          this.router.navigate(['/dashboard/game']);
        },
        error: (e: HttpErrorResponse ) =>
        {
          console.log("error: ", e, " failed to update 'roomkey'")
        }
      }
    );
    }
    
    flappyGame() {
      this.userService.updateRoomKey(-1).subscribe(
        {
          next: () =>
          {
            this.router.navigate(['/dashboard/game']);
          },
          error: (e: HttpErrorResponse ) =>
          {
            console.log("error: ", e, " failed to update 'roomkey'")
          }
        }
      );
    }

    bossPongSingle() {
      this.userService.updateRoomKey(-1).subscribe(
        {
          next: () =>
          {
            this.router.navigate(['/dashboard/bossPong']);
          },
          error: (e: HttpErrorResponse ) =>
          {
            console.log("error: ", e, " failed to update 'roomkey'")
          }
        }
      );
    }

    bossPongMulti() {
      this.userService.updateRoomKey(1).subscribe(
        {
          next: () =>
          {
            this.router.navigate(['/dashboard/bossPong']);
          },
          error: (e: HttpErrorResponse ) =>
          {
            console.log("error: ", e, " failed to update 'roomkey'")
          }
        }
      );
    }
}

