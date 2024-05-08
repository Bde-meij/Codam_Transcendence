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
	namespace: "/game"
	// cors: { origin: '/frontend' }, (might be better?)
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() io: Server;

	afterInit() {
		console.log("server initialized");
	}

	handleConnection(client: any, ...args: any[]) {
		const { sockets } = this.io.sockets;

		console.log("game: user " + client.id + " connected");
	}
	
	handleDisconnect(client: any) {
		console.log("game: user " + client.id + " disconnected");
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): string {
		console.log('chat: message recieved from ' + client.id + ': ' + data);
		client.broadcast.emit('message', data);
		return data;
	}
}
