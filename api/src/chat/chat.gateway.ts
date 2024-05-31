import { NotAcceptableException, Req } from '@nestjs/common';
import { ChatRoomListDto, userDto } from './chatRoom.dto';
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
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
	cors: { origin: 'http://localhost:4200' },
	namespace: "/chat"
	// cors: { origin: '/frontend' }, (might be better?)
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() 
	io: Server;
	chatRoomList: Record<string, ChatRoomListDto>;
  	userList: Record<string, userDto>;
	private connectedUsers: string[] = [];
	constructor(private authService: AuthService, private userService: UserService) {
		this.chatRoomList = {
			lobby: {
			  roomId: 'lobby',
			  roomName: 'lobby',
			  adminList: [],
			  banList: [],
			  muteList: [],
			  password: undefined,
			},
		  };
		this.userList = {};
	}

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
			// console.log("users: " + this.connectedUsers);
			this.connectedUsers.push(client.id);
			console.log("users: " + this.connectedUsers);
			// const rooms = this.io.sockets.adapter.rooms;
		  	client.emit('getRooms', Array.from(client.rooms));
			client.emit('getConnectedUsers', this.connectedUsers);
			console.log(Array.from(client.rooms))
		  	// console.log('roomList: ' +  Array.from(rooms.keys()));
			// const sockets = await io.fetchSockets();
		} catch {
			console.log(client.id, "connection refused");
			client.disconnect();
			return;
		}
		
	}
	
	handleDisconnect(client: any) {
		console.log("chat: user " + client.id + " disconnected");
		this.connectedUsers = this.connectedUsers.filter(item => item !== client.id);
		client.emit('getRooms', Array.from(client.rooms));
	}
	
	// @SubscribeMessage('message')
	// async handleMessage(
	// 	@MessageBody() data: string,
	// 	@ConnectedSocket() client: Socket
	// ) {
	// 	console.log('chat: message recieved from ' + client.data.nickname + ': ' + data);
	// 	client.broadcast.emit('message', client.data.nickname + ": " + data);
		
	// 	return data;
	// }

	@SubscribeMessage('message')
	async handleMessage(
		@MessageBody() data: { message: string, sender: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = socket.data.nickname;
		const message = data.message;
		const chatRoom = this.chatRoomList[socket.data.roomId];
		this.io
		.to(socket.data.roomId)
		.emit('message', { nickname: nickname, message: message });
		console.log("send message: " + socket.data.roomId + ", nickname: " + nickname + ", msg: " + message + ", chat name: " + socket.id )
	}

	@SubscribeMessage('createRoom')
	async createRoom(
	@MessageBody() data: { roomId: string; password: string },
	@ConnectedSocket() socket: Socket,
	) {
		console.log("createRoom called: " + data.roomId);
		
		const roomId = data.roomId;
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		this.chatRoomList[roomId] = {
			roomId: roomId,
			roomName: roomId,
			adminList: [socket.data.nickname],
			banList: [],
			muteList: [],
			password: data.password,
		};
		if (!this.userList[socket.data.nickname]) {
			this.userList[socket.data.nickname] = {
			  roomId: '',
			  nickname: socket.data.nickname,
			  socketId: socket.id,
			  isAdmin: false,
			};
		  }
		this.userList[socket.data.nickname].roomId = roomId;
		this.userList[socket.data.nickname].isAdmin = true;
		socket.join(roomId);
		// socket.emit('joinRoom', { roomName: roomId });
		// this.io.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(roomId);	
		// socket.emit('isAdmin');
		console.log('roomList: ' +  Array.from(socket.rooms));
		// console.log('roomList: ' +  Array.from(socket.rooms)[1]);
		console.log('socket nickname: ' +  socket.data.roomId);


		// console.log('roomList: ' + (Object.keys(socket.rooms)));
		// for (const value of socket.rooms) {
		// 	console.log(value);
		//   }

		socket.emit('getRooms', Array.from(socket.rooms).slice(1));
	}

	async channelUserList(roomId: string) {
		const users = [];
		// const sockets = this.io.sockets.adapter.rooms.get(roomId);
		// const sockets = await this.io.of("/chat").in(roomId).allSockets();
		const sockets = await this.io.in(roomId).fetchSockets();
		if (!sockets)
		  return;
		sockets.forEach((obj) => {
			users.push(obj.id);
			console.log("user: " + obj.data.nickname);
		});
		this.io.to(roomId).emit('userList', users);
		console.log("channelUserList: " + users);
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(
	@MessageBody() data: { roomId: string, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		console.log("joinRoom api: " + data.roomId);
		const roomId = data.roomId;
		// const Room = Object.values(this.chatRoomList).find(
		// 	(room) => room.roomId === roomId,
		// );
		// if (Room === undefined) {
		// 	socket.emit('errorMessage', 'The room does not exists.',);
		// 	return;
		// }
		// else if (Room.roomId === socket.data.roomId) {
		// 	socket.emit('systemMessage', 'You have already entered the room.');
		// 	return;
		// }
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		socket.join(roomId);
		this.userList[socket.data.nickname].roomId = roomId;
		// socket.emit('joinRoom', { roomName: roomId });
		console.log("joinroom: " + roomId);
		// this.io.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(roomId);
	}
	// check pw
	@SubscribeMessage('joinPrivateRoom') async joinPrivateRoom(){}
	@SubscribeMessage('leaveRoom') async leaveChannel() {
		// async leaveRoom(client: Socket, room: string): void {
		// 	client.leave(room);
	}
	@SubscribeMessage('addAdmin') async addAdmins() {}
	@SubscribeMessage('removeAdmin') async removeAdmins() {}
	@SubscribeMessage('changePassword') async changePassword() {}
	@SubscribeMessage('mute') async mute() {}
	@SubscribeMessage('unMute') async unMute() {}
	@SubscribeMessage('ban') async ban() {}
	@SubscribeMessage('unBan') async unban() {}
}
