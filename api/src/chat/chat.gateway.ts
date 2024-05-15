import { NotAcceptableException, Req } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
	cors: { origin: 'http://localhost:4200' },
	namespace: "/chat"
	// cors: { origin: '/frontend' }, (might be better?)
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() io: Server;

	constructor(private authService: AuthService, private userService: UserService) {}

	afterInit() {
		console.log("server initialized");
	}

	async handleConnection(client: Socket) {
		try {
			console.log(client.id, "connecting...");
			const cookies = client.handshake.headers.cookie?.split('; ');
			if (!cookies)
				throw new NotAcceptableException();
			var token: string;
			for (var cookie of cookies) {
				const [key, value] = cookie.split('=');
				// console.log(value);
				if (key === 'access_token') {
					token = value;
					break;
				}
			}
			if (!token)
				throw new NotAcceptableException();
			const payload = await this.authService.verifyJwtAccessToken(token);
			const user = await this.userService.findUserById(payload.id);
			if (!user)
				throw new NotAcceptableException();
			client.data.nickname = user.nickname;
			console.log(user.nickname, "connected on socket:", client.id);
		} catch {
			console.log(client.id, "connection refused");
			client.disconnect();
			return;
		}
		
	}
	
	handleDisconnect(client: any) {
		console.log("chat: user " + client.id + " disconnected");
	}
	
	@SubscribeMessage('message')
	async handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		console.log('chat: message recieved from ' + client.data.nickname + ': ' + data);
		client.broadcast.emit('message', client.data.nickname + ": " + data);
		return data;
	}
}
