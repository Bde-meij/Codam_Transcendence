import { NotAcceptableException, Req } from '@nestjs/common';
import { Rooms, userDto, MessageInterface } from './chatRoom.dto';
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
	chatRoomList: Record<string, Rooms>;
  	userList: Record<string, userDto>;
	private connectedUsers: string[] = [];

	constructor(private authService: AuthService, private userService: UserService) {
		this.chatRoomList = {
			lobby: {
			  id: 'roomid',
			  name: 'roomname',
			  owner: "owner",
			  admins: [],
			  banned: [],
			  muted: [],
			  status: "public",
			  password: null,
			},
		  };
		this.userList = {};
	}

	afterInit() {
		console.log("server initialized");
	}



	async handleConnection(client: Socket) {
		try {
			console.log("handleConnection: " + client.id + "connecting...");
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
			// client.data.id = user.id;
			this.connectedUsers.push(user.id);
			client.emit('getConnectedUsers', this.connectedUsers);
			this.getRoomsEmit(client);
			

			console.log(user.nickname, "connected on socketID:", client.id);
			console.log("ConnectedUsers: " + this.connectedUsers);
			console.log(Array.from(client.rooms))
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
		@MessageBody() data: { message: string, sender: string, room: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = socket.data.nickname;
		const message = data.message;
		const room = data.room;

		const chatRoom = this.chatRoomList[room];
		console.log(chatRoom);
		// const chatRoom = this.chatRoomList[socket.data.id];
		
		this.io
		.to(socket.data.id)
		.emit('message', { nickname: nickname, message: message });
		console.log("send message: " + data.room + ", nickname: " + nickname + ", msg: " + message + ", chat name: " + socket.id )
	}

	@SubscribeMessage('createRoom')
	async createRoom(
	@MessageBody() data: { id: string; password: string },
	@ConnectedSocket() socket: Socket,
	) {
		console.log("createRoom called: " + data.id);
		
		const id = data.id;
		socket.data.id = id;
		socket.data.name = id;
		this.chatRoomList[id] = {
			id: id,
			name: id,
			owner: socket.data.nickname,
			admins: [socket.data.nickname],
			banned: [],
			muted: [],
			status: "public",
			password: data.password,
			messages: [], 
		  };
		if (!this.userList[socket.data.nickname]) {
			this.userList[socket.data.nickname] = {
			  roomId: '',
			  nickname: socket.data.nickname,
			  socketId: socket.id,
			  isAdmin: false,
			};
		  }
		this.userList[socket.data.nickname].roomId = id;
		this.userList[socket.data.nickname].isAdmin = true;

		socket.join(id);
		// socket.emit('joinRoom', { name: id });
		// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
		this.channelUserList(id);	
		// socket.emit('isAdmin');
		console.log('roomList: ' +  Array.from(socket.rooms));
		// console.log('roomList: ' +  Array.from(socket.rooms)[1]);
		console.log('socket nickname: ' +  socket.data.id);
		this.getInfoRoom(this.chatRoomList[id]);


		// console.log('roomList: ' + (Object.keys(socket.rooms)));
		// for (const value of socket.rooms) {
		// 	console.log(value);
		//   }

		socket.emit('getRooms', Array.from(socket.rooms).slice(1));
	}

	async channelUserList(id: string) {
		const users = [];
		// const sockets = this.io.sockets.adapter.rooms.get(id);
		// const sockets = await this.io.of("/chat").in(id).allSockets();
		const sockets = await this.io.in(id).fetchSockets();
		if (!sockets)
		  return;
		sockets.forEach((obj) => {
			users.push(obj.id);
			// console.log("channelUserList: " + obj.data.nickname);
		});
		this.io.to(id).emit('userList', users);
		// console.log("channelUserList: " + users);
	}

	async getRoomsEmit(socket: Socket){
		const p = Array.from(socket.rooms).filter(item => item !== socket.id);;
		socket.emit('getRooms', p);
		// client.emit('getRooms', Array.from(client.rooms));
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(
	@MessageBody() data: { id: string, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		// console.log("joinRoom api: " + data.id);
		const id = data.id;
		// const Room = Object.values(this.chatRoomList).find(
		// 	(room) => room.id === id,
		// );
		// if (Room === undefined) {
		// 	socket.emit('errorMessage', 'The room does not exists.',);
		// 	return;
		// }
		// else if (Room.id === socket.data.id) {
		// 	socket.emit('systemMessage', 'You have already entered the room.');
		// 	return;
		// }
		socket.data.id = id;
		socket.data.name = id;
		socket.join(id);
		this.userList[socket.data.nickname].roomId = id;
		// socket.emit('joinRoom', { name: id });
		// console.log("joinroom: " + id);
		// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
		this.channelUserList(id);
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

	private addMessageToRoom(message: MessageInterface): void {
		const roomId = message.roomId;
	
		if (this.chatRoomList[roomId]) {
		  if (!this.chatRoomList[roomId].messages) {
			this.chatRoomList[roomId].messages = [];
		  }
		  this.chatRoomList[roomId].messages?.push(message);
		  console.log(`Message added to room ${roomId}:`, message);
		} else {
		  console.error(`Room with ID ${roomId} not found`);
		}
	}

	private getInfoRoom(room: Rooms): void {
		// console.log("---- Info Room ----")
		// console.log(room);
	}
	
}
