import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	constructor(private userService: UserService, private router: Router) {};

	success = false;

	default_avatar: File = new File(["default_avatar"], "/assets/src/images/default_avatar.png");

	registration : UserInterface = {
		intraId: '',
		nickname: '',
		status: '',
		avatar: this.default_avatar,
	};

	register() {
		this.userService.registerUser(this.registration).subscribe(
			// () => {
			// 	this.router.navigate(['/dashboard']);
			// },
			(error) => {
				console.log(error.message);
			}
		);
		
		this.router.navigate(['/dashboard']);
	};
}
