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
import { PasswordService } from 'src/password/password.service';

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
	
	constructor(private authService: AuthService, private userService: UserService, private passwordList: PasswordService) {
		this.chatRoomList = {};
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
			if (!user.nickname){
				user.nickname = "Empty nickname Error";
			}
			
			client.data.nickname = user.nickname;
			client.data.userid = user.id;

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
		const nickname = client.data.userid;
		const index = this.connectedUsers.indexOf(nickname);
		if (index > -1) {
			this.connectedUsers.splice(index, 1);
			console.log(`User disconnected: ${nickname}`);
			console.log(`Connected users: ${this.connectedUsers}`);
		}
		console.log("----------------------------------"); 
		console.log("chat: user " + client.data.nickname + " disconnected: " + client.nickname + ", client: " + client.id);
	}
	
	@SubscribeMessage('message')
	async handleMessage(
		@MessageBody() data: { message: string, sender: string, room: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = socket.data.nickname;
		const message: MessageInterface = {
			message: data.message,
			roomId: data.room,
			senderId: socket.data.userid, // Assuming userId is available in socket.data
			created: this.addDate(),
		};

		const chatRoom = this.chatRoomList[data.room];

		// console.log(chatRoom);
		// const chatRoom = this.chatRoomList[socket.data.id];
		console.log("room: " + data.room + ", socketdataid: " + socket.data.id);
		// console.log(chatRoom.users);
		this.addDate();
		this.io
		.to(socket.data.id)
		.emit('message', message);
		console.log("handleMessage: " + data.room + ", nickname: " + socket.data.nickname + ", msg: " + message.message + ", chat name: " + socket.id + ", room: " + message.roomId )
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
			muted: {},
			users: [socket.data.nickname],
			status: "public",
			password: data.password,
			messages: [], 
		  };

		socket.join(id);
		console.log("created and join: " + id);
		// socket.emit('joinRoom', { name: id });
		// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
		this.channelUserList(id);	
		// socket.emit('isAdmin');
		
		console.log('roomList: ' +  Array.from(socket.rooms));
		// console.log('roomList: ' +  Array.from(socket.rooms)[1]);
		console.log('socket nickname: ' +  socket.data.nickname);
		// this.getInfoRoom(this.chatRoomList[id]);


		// console.log('roomList: ' + (Object.keys(socket.rooms)));
		//
		// socket.emit('getRooms', Array.from(socket.rooms).slice(1));
		socket.emit('getRoomss', this.chatRoomList);
		// console.log(this.chatRoomList);
		
	}

	async channelUserList(id: string) {
		const users = [];
		// const sockets = this.io.sockets.adapter.rooms.get(id);
		// const sockets = await this.io.of("/chat").in(id).allSockets();
		const sockets = await this.io.in(id).fetchSockets();
		if (!sockets)
		  return;
		sockets.forEach((obj) => {
			users.push(obj.data.nickname);
			console.log("channelUserList: " + obj.data.nickname);
		});
		this.io.to(id).emit('userList', users);
		// console.log("channelUserList: " + users);
	}

	async getRoomsEmit(socket: Socket){
		const p = Array.from(socket.rooms).filter(item => item !== socket.id);
		socket.emit('getRooms', p);
		// client.emit('getRooms', Array.from(client.rooms));
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(
	@MessageBody() data: { id: string, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		console.log("joinRoom api: " + data.id);
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
		console.log("joined: " + id);
	
		// socket.emit('joinRoom', { name: id });
		// console.log("joinroom: " + id);
		// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
		this.chatRoomList[id].users.push(id);
		// console.log(this.chatRoomList[id].users);
		this.channelUserList(id);
	}
	
	@SubscribeMessage('leaveRoom')
	async leaveRoom(
	@MessageBody() data: { room: string; userid: string },
	@ConnectedSocket() client: Socket) {
		console.log("LEAVEROOM:-----")
		console.log(client.rooms);
		for (const value of client.rooms) {
			console.log(value);
			// console.log(value.data.id);

		}
		// const sockets = this.io.sockets.adapter.rooms.get(data.room);
		// console.log(sockets);
		// for (const socketId of sockets) {
		// 	const target = this.io.sockets.sockets.get(socketId);
		// 	if (target.data.nickname === data.userid) {
		// 		console.log(target);
		// 		console.log(target.data.name);
		// 		console.log(target.data.nickname);
		// 		console.log(target.data.userid);
		// 		console.log(target.data.id);
		// 		client.leave(target.data.id);
		// 	}
		// }
		// console.log(target);
		// console.log(target.data.name);
		// console.log(target.data.nickname);
		// console.log(target.data.userid);
		// console.log(target.data.id);
		console.log("leaveRoom: " + data.room);
		console.log("LEAVEROOM:-----")

	  	client.leave(data.room);
		this.chatRoomList[data.room].users = this.chatRoomList[data.room].users.filter((item: string) => item !== data.userid);
		// this.chatRoomList = this.chatRoomList[data.room].filter((item: string) => item !== data.userid);
		client.emit('getRoomss', this.chatRoomList);
	}

	// check pw
	@SubscribeMessage('joinPrivateRoom') async joinPrivateRoom(){}
	
	@SubscribeMessage('addAdmin') async addAdmins() {}
	@SubscribeMessage('removeAdmin') async removeAdmins() {}
	@SubscribeMessage('changePassword') async changePassword() {}
	
	@SubscribeMessage('mute') async mute(
	@MessageBody() data: { room: string; userid: string },
	@ConnectedSocket() client: Socket) 
	{
		this.chatRoomList[data.room].muted[data.userid] = new Date();
	}

	@SubscribeMessage('unMute') async unMute(
	@MessageBody() data: { room: string; userid: string },
	@ConnectedSocket() client: Socket)
	{
		if (this.chatRoomList[data.room].muted[data.userid]){
			delete this.chatRoomList[data.room].muted[data.userid];
		}
	}
	
	@SubscribeMessage('ban') async ban(
	@MessageBody() data: { room: string; userid: string },
	@ConnectedSocket() client: Socket)
	{
		this.chatRoomList[data.room].banned.push(data.userid);
	}

	@SubscribeMessage('unBan') async unban(
	@MessageBody() data: { room: string; userid: string },
	@ConnectedSocket() client: Socket)
	{
		if (this.chatRoomList[data.room].banned.push(data.userid)){
			this.chatRoomList[data.room].banned = this.chatRoomList[data.room].banned.filter(item => item == data.userid);
		}
	}

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
		console.log("---- Info Room ----")
		console.log(room);
	}
	
	private addDate(){
		const created = new Date();
		created.setHours(created.getHours() + 2)
		const timeString = created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    	console.log("Message time:", timeString);
		return timeString;
	}

	private isBanned(roomId: string, userid : string){
		if (this.chatRoomList[roomId] && this.chatRoomList[roomId].muted && Array.isArray(this.chatRoomList[roomId].muted[userid])) {
			console.log("You is banned: " + userid);
			return true;
		}
		console.log("NOT banned: " + userid);
		return false;
	}

	private isMuted(roomId: string, userid : string){
		if (this.chatRoomList[roomId] && this.chatRoomList[roomId].muted && Array.isArray(this.chatRoomList[roomId].muted[userid])) {
			console.log("You is muted: " + userid);
			return true;
		}
		console.log("NOT muted: " + userid);
		return false;
	}
}
