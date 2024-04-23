import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {
	constructor(private auth: AuthService, private router: Router, private actRoute: ActivatedRoute) {}

	ngOnInit(): void {
		this.actRoute.queryParams.subscribe(params => {
		  const code = params['code'];
		  if (code) {
			this.auth.sendCode(code).subscribe(
			  response => {
				console.log('Authorization successful:', response);
				this.router.navigate(['/dashboard']);
			  },
			  error => {
				console.error('Error sending authorization code:', error);
			  }
			);
		  } else {
			console.error('Authorization code not found in URL.');
		  }
		});
	  }
	}
		/*console.log(window.location.search);
		auth.sendCode(window.location.search).subscribe(
			response => {
				console.log('Response: ', response);
			},
			error => {
				console.log('Error: ', error);
			}
		);
		router.navigate(['/dashboard']);
	};*/
