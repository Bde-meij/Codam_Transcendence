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

@WebSocketGateway({
	cors: { origin: 'http://localhost:4200' },
	// cors: { origin: '/frontend' }, (might be better?)
	namespace: '/api/chat-socket',
	path: '/api/chat-socket/socket.io',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() io: Server;

	afterInit() {
		console.log("server initialized");
	}

	handleConnection(client: any, ...args: any[]) {
		const { sockets } = this.io.sockets;

		console.log("user " + client.id + " connected");
	}
	
	handleDisconnect(client: any) {
		console.log("user " + client.id + " disconnected");
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): string {
		console.log('message recieved from ' + client.id + ': ' + data);
		client.broadcast.emit('message', data);
		return 'Hello world!';
	}
}
