import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserInterface } from '../../models/user.class';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	constructor(private userService: UserService) {};

	default_avatar: File = new File(["default_avatar"], "/assets/src/images/default_avatar.png");

	registration : UserInterface = {
		intraId: '',
		nickname: '',
		status: '',
		avatar: this.default_avatar,
	};

	register() {
		this.userService.registerUser(this.registration).subscribe(error => console.log(error));
	};
}
