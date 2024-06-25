import { Global, NotAcceptableException, Req } from '@nestjs/common';
import { Rooms, RoomInfo, MessageInterface } from './chatRoom.dto';
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
import { Loggary } from 'src/logger/logger.service';
import { PasswordService } from 'src/password/password.service';
import { getNewRoomKey} from 'src/game/game.gateway';

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
  	room_info: Record<string, RoomInfo>;
	private connectedUsers: string[] = [];
	gateway_roomid: number;
	// fake_userid: number = 77000;
	// loggary: Loggary;
	constructor(private authService: AuthService, private userService: UserService, private passwordList: PasswordService) {
		this.chatRoomList = {};
		this.room_info = {};
		this.gateway_roomid = 0;
	}

	afterInit() {
		//console.log("server initialized");
		this.createTestRooms();
		
	}

	async handleConnection(client: Socket) {
		try {
			//console.log("handleConnection: " + client.id + "connecting...");
			const cookies = client.handshake.headers.cookie?.split('; ');
			if (!cookies)
				throw new NotAcceptableException();
			var token: string;
			for (var cookie of cookies) {
				const [key, value] = cookie.split('=');
				// //console.log(value);
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
			// this.fake_userid++;
            // client.data.key = user.roomKey;
			
			this.joinArrayChats(client, client.data.nickname, client.data.userid);
			this.connectedUsers.push(client.data.userid);
			client.emit('getConnectedUsers', this.connectedUsers);
			// this.getRoomsEmit(client);
			client.emit('user', user);
			// client.join("Global");
			// this.chatRoomList["Global"].users.push(client.data.nickname);
			// this.chatRoomList["Global"].users.push("test");
			// this.chatRoomList["Global"].users.push("tedfd");
			// client.join("Help");
			// this.chatRoomList["Help"].users.push(client.data.nickname);
			// client.join("Help");
			//console.log(user.nickname, "connected on socketID:", client.id);
			// this.updateUserRooms(client.data.userid, client.data.nickname);
			//console.log("ConnectedUsers: " + this.connectedUsers);
			//console.log(Array.from(client.rooms))
			client.emit('getRoomss', this.chatRoomList);
		} catch {
			//console.log(client.id, "connection refused");
			client.disconnect();
			return;
		}
		
	}
	
	handleDisconnect(client: any) {
		const userid = client.data.userid;
		const index = this.connectedUsers.indexOf(userid);
		if (index > -1) {
			this.connectedUsers.splice(index, 1);
			//console.log(`${userid} disconnected: ${client.data.nickname} `);
			//console.log(`Connected users: ${this.connectedUsers}`);
		}
		//console.log("----------------------------------"); 
		//console.log("chat: user " + client.data.nickname + " disconnected: " + client.data.nickname + ", client: " + client.id);
	}
	
		// socket.emit('joinRoom', { name: id });
	// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
	// socket.emit('isAdmin');
	// //console.log('roomList: ' +  Array.from(socket.rooms)[1]);
	// this.getInfoRoom(this.chatRoomList[id]);
	// //console.log('roomList: ' + (Object.keys(socket.rooms)));
	// socket.emit('getRooms', Array.from(socket.rooms).slice(1));
	// //console.log(this.chatRoomList);
	// //console.log("created and join: " + id);
	// //console.log('roomList: ' +  Array.from(socket.rooms));
	// //console.log('socket nickname: ' +  socket.data.nickname);
	@SubscribeMessage('createRoom')
	async createRoom(
	@MessageBody() data: { room_name: string; status: string, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		//check if exists if so exit
		const Room = Object.values(this.chatRoomList).find(
			(room_name) => room_name.name === data.room_name,
		);
		if (Room) {
			socket.emit('Room already exists, please pick another name',);
			return;
		}
		//console.log("createRoom called: " + data.room_name);
		socket.data.id = this.gateway_roomid;
		socket.data.name = data.room_name;
		this.chatRoomList[data.room_name] = {
			id: this.gateway_roomid,
			name: data.room_name,
			owner: socket.data.nickname,
			admins: [socket.data.nickname],
			banned: [],
			muted: {},
			users: [socket.data.userid],
			status: "public",
			password: data.password,
			messages: [], 
		};
		//console.log(`socket data nickname: ${socket.data.nickname} en ${socket.data.id} en ${socket.id}`);
		if (!this.room_info[socket.data.nickname]) {
			this.room_info[socket.data.nickname] = {
			room_id: this.chatRoomList[data.room_name].id,
			nickname: data.room_name,
			Owner: true,
			Admin: true,
			socket_id: socket.id,
		  }
		}
		this.chatRoomList[data.room_name].users.push(77600);
		socket.join(socket.data.id.toString());
		//frontendimplemen
		socket.emit('joinRoom', { room_id: socket.data.id, room_name: data.room_name });
		//msg get messages?
		socket.emit('getRoomss', this.chatRoomList);
		
		this.channelUserList(data.room_name);	
		//change this for UUID counter
		this.gateway_roomid++;
		//console.log("Created room: " + socket.data.id)
	}

	// //console.log(chatRoom);
	// const chatRoom = this.chatRoomList[socket.data.id];
	// //console.log(chatRoom.users);
	@SubscribeMessage('message')
	async handleMessage(
	@MessageBody() data: { message: string, sender: string, sender_id: number, room: string },
	@ConnectedSocket() socket: Socket,
	) {
		//console.log("handleMessage: " + data.room);
		const Room = this.findRoom(data.room, "message");
		// if (!Room.users.includes(data.sender_id)){
		// 	//console.log(`handleMessage: not send, ${data.sender_id} not in list ${Room.users} `);
		// 	return;
		// }
		//console.log("handleMessage: " + data.room + ", " + Room.id);
		const nickname = socket.data.nickname;
		const message: MessageInterface = {
			message: data.message,
			roomId: Room.id,
			room_name: data.room,
			senderId: socket.data.userid,  // check 
			created: new Date(),
		};
		//console.log(`users: ${this.chatRoomList[data.room].users}`)
		if (this.isMuted(data.room, data.sender_id, data.sender)){
			// this.io.to(Room.id.toString()).emit('system', message);
			//console.log("handleMessage: Ismuted");
		}
		if (this.isBanned(data.room, data.sender_id)){
			//console.log("handleMessage: Isbanned");
		}
		// //console.log("room: " + data.room + ", socketdataid: " + socket.data.userid);
		// this.addDate();
		this.io.to(Room.id.toString()).emit('message', message);
		this.channelUserList(Room.name);
	}

	// const sockets = this.io.sockets.adapter.rooms.get(id);
	// const sockets = await this.io.of("/chat").in(id).allSockets();
	// //console.log("channelUserList: " + users);

	//room number
	async channelUserList(id: string) {
		const users = [];
		var name = "";
		const sockets = await this.io.in(id).fetchSockets();
		if (!sockets)
		  return;
		sockets.forEach((obj) => {
			users.push(obj.data.nickname);
			if (name == "")
				name = obj.data.name;
		});
		//console.log("UserList [" + name + "==" + id + "] " + users);
		this.io.to(id).emit('userList', users);
	}

	async getRoomsEmit(socket: Socket){
		const p = Array.from(socket.rooms).filter(item => item !== socket.id);
		socket.emit('getRooms', p);
		// client.emit('getRooms', Array.from(client.rooms));
	}
	
	// //console.log("joinroom: " + id);
	// this.io.to(socket.data.id).emit('addUser', socket.data.nickname);
	// //console.log(this.chatRoomList[id].users);
	@SubscribeMessage('joinRoom')
	async joinRoom(
	@MessageBody() data: { room_name: string, user_id: number, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		//console.log("joinRoom: " + data.room_name + ", socketid: " + socket.data.id + ", nickname:" + socket.data.nickname);
		const room = this.findRoom(data.room_name, "joinRoom");
		if (!this.chatRoomList[data.room_name]){
			//console.log(`the room does not exists.`);
			return;
		}
		//console.log(data.room_name);
		if (!this.isBanned(data.room_name, data.user_id)){
			// check if banned
			// socket.data.id = id;
			// socket.data.name = id;
			socket.join(room.id.toString());
			this.chatRoomList[data.room_name].users.push(socket.data.userid);
			//console.log("joinedRoom: " + room.id + ", name: " + room.name + ", users: " + room.users);
			this.channelUserList(room.id.toString());
		}
	}
	
	@SubscribeMessage('leaveRoom')
	async leaveRoom(
	@MessageBody() data: { room: string; username: string, userid: number },
	@ConnectedSocket() client: Socket) {
		//console.log("-------LEAVEROOM:")
		//console.log(client.rooms);
		
		for (const value of client.rooms) {
			//console.log(value);
			// //console.log(value.data.id);
		}
		// const sockets = this.io.sockets.adapter.rooms.get(data.room);
		// //console.log(sockets);
		// for (const socketId of sockets) {
		// 	const target = this.io.sockets.sockets.get(socketId);
		// 	if (target.data.nickname === data.userid) {
		// 		//console.log(target);
		// 		//console.log(target.data.name);
		// 		//console.log(target.data.nickname);
		// 		//console.log(target.data.userid);
		// 		//console.log(target.data.id);
		// 		client.leave(target.data.id);
		// 	}
		// }
		// //console.log(target);
		// //console.log(target.data.name);
		// //console.log(target.data.nickname);
		// //console.log(target.data.userid);
		// //console.log(target.data.id);
		//console.log("leaveRoom: " + data.room);
		//console.log("LEAVEROOM:-----")

	  	client.leave(data.room);
		if(this.chatRoomList[data.room])
			this.chatRoomList[data.room].users = this.chatRoomList[data.room].users.filter((item: number) => item !== data.userid);
		// this.chatRoomList = this.chatRoomList[data.room].filter((item: string) => item !== data.userid);
		client.emit('getRoomss', this.chatRoomList);
	}

	@SubscribeMessage('changePassword') async changePassword(
	@MessageBody() data: { password: string; room: string; userid: number, username: string  },
	@ConnectedSocket() client: Socket) 
	{
		const room = this.findRoom(data.room, "changePassword");
		if (this.isOwner(data.userid, data.room)){
			this.chatRoomList[data.room].password = data.password;
			this.io.to(room.id.toString()).emit('system', `Password changed`);
		}
	}
	
	@SubscribeMessage('mute') async mute(
	@MessageBody() data: { room: string; userid: number, username: string  },
	@ConnectedSocket() client: Socket) 
	{
		//check if room exists
		//console.log("mute " + data.userid);
		const room = this.findRoom(data.room, "ban");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room)){
			this.chatRoomList[data.room].muted[data.userid] = new Date();
			this.io.to(room.id.toString()).emit('system', `${data.username} + " is muted`);
		}
		//emit mute notification in chat
	}

	@SubscribeMessage('unMute') async unMute(
	@MessageBody() data: { room: string; userid: number, username: string  },
	@ConnectedSocket() client: Socket)
	{
		//check if room exists
		const room = this.findRoom(data.room, "unMute");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room)){
			if (this.chatRoomList[data.room].muted[data.userid]){
				delete this.chatRoomList[data.room].muted[data.userid];
				this.io.in(room.id.toString()).emit("system", `${data.username} is unmuted.`)
			}
		}
	}
	
	@SubscribeMessage('ban') async ban(
	@MessageBody() data: { room: string; userid: number, username: string },
	@ConnectedSocket() client: Socket)
	{
		//console.log("ban: " + data.userid + ", in: " + data.room )
		
		const room = this.findRoom(data.room, "ban");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room)){
			this.chatRoomList[data.room].banned.push(data.userid);
			this.kickUserId(data.userid, data.room)
			this.chatRoomList[data.room].users = this.chatRoomList[data.room].users.filter((item: number) => item !== data.userid);
			this.io.in(room.id.toString()).emit("system", `${data.username} is banned.`)
		}
		this.channelUserList(data.room);
		//emit ban notification in chat

	}

	@SubscribeMessage('unBan') async unban(
	@MessageBody() data: { room: string; userid: number, username: string },
	@ConnectedSocket() client: Socket)
	{
		//check if room exists
		//console.log("unBan: " + data.userid + ", in: " + data.room )

		const room = this.findRoom(data.room, "Unban");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room)){
			if (this.chatRoomList[data.room].banned.push(data.userid)){
				this.chatRoomList[data.room].banned = this.chatRoomList[data.room].banned.filter(item => item == data.userid);
			}
			this.io.in(room.id.toString()).emit("system", `${data.username} is unbanned.`)
		}
		//emit unban notification in chat
	}

	@SubscribeMessage('kick') async kick(
	@MessageBody() data: { room: string; userid: number },
	@ConnectedSocket() client: Socket) 
	{
		//console.log("kick: " + data.userid + ", in: " + data.room )
		const room = this.findRoom(data.room, "kick");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room))
			this.kickUserId(data.userid, data.room)
		else
			//console.log("not admin");
			// this.io.in(data.room).emit("error", `not admin`)
		//kick user
		this.channelUserList(data.room);
	}

	private kickUserId(userid: number, roomid: string){
		const sockets = this.io.sockets.adapter.rooms.get(roomid);
		//console.log(sockets);
		for (const socketId of sockets) {
			const target = this.io.sockets.sockets.get(socketId);
			//console.log("kickUserId: targetnickname: " + target.data.nickname + "== userid: " + userid)
			if (target.data.userid === userid) {
				//console.log("kickUserId: found socket");
				target.leave(roomid);
				this.io.in(roomid).emit("system", `${target.data.nickname} has been kicked`)
				this.chatRoomList[roomid].users = this.chatRoomList[roomid].users.filter((item: number) => item !== target.data.userid);
				this.channelUserList(roomid);
				return true;
			}
		}
		//console.log("kickUserId: not found socket");
		return false;
		// find socket of the room.
		// find socket of the userid
		// leaveroom(socket)
		// emit user got kicked
	}



	@SubscribeMessage('joinPrivateRoom') async joinPrivateRoom(){}
	@SubscribeMessage('addAdmin') async addAdmins() {}
	@SubscribeMessage('removeAdmin') async removeAdmins() {}




	@SubscribeMessage('inviteGame') async inviteGame(
	@MessageBody() data: { roomid: number; room_name: string, userid: number },
	@ConnectedSocket() client: Socket) 
	{	
		const roomKey = getNewRoomKey(); // nummer
		//console.log(`InviteGame ${data.roomid} en ${roomKey}`)
		this.userService.updateRoomKey(client.data.userid, roomKey);
		//console.log("invitegame: " + client.data.userid + ", userid: " + data.userid);
		// //console.log(data.room + ", " + client.data.id)
		const message: MessageInterface = {
			message: roomKey.toString(),
			roomId: data.roomid,
			room_name: data.room_name,
			senderId: data.userid,  // check 
			created: new Date(),
			game: true
		};
		this.io.in(data.roomid.toString()).emit('message', message);
	}

	@SubscribeMessage('joinBattle') async joinBattle(
	@MessageBody() data: { numroom: string },
	@ConnectedSocket() client: Socket) 
	{	
		//console.log("joinbattle: " + data.numroom);
		this.userService.updateRoomKey(client.data.userid.toString(), Number(data.numroom));
		// joinInvRoom(89413, 1);
		// //console.log("invitegame: " + client.data.id + ", userid: " + data.userid);
		// //console.log(data.room + ", " + client.data.id)
		// const message: MessageInterface = {
		// 	message: numroom.toString(),
		// 	roomId: data.room,
		// 	senderId: client.data.userid,  // check 
		// 	created: this.addDate(),
		// };
		// this.io.in(data.room).emit('message', message);
		// this.io.to(client.data.id).emit('message', "hello");
	}

	// @SubscribeMessage('initRoom')
	// async initRoom(
	// @MessageBody() data: { room_name: string; sender_name: string },
	// @ConnectedSocket() socket: Socket,
	// ) {
	// 	//console.log("initRoom: " + data.room_name + ", socketid: " + socket.data.id + ", nickname:" + socket.data.nickname);
	// 	const id = data.room_name;
	// 	const Room = Object.values(this.chatRoomList).find(
	// 		(room) => room.name === id,
	// 	);
	// 	if (Room === undefined) {
	// 		socket.emit('errorMessage', 'The room does not exists.',);
	// 		return;
	// 	}
	// 	//console.log(Room.id);
	// 	if (!Room.users.includes(data.sender_name))
	// 		return;
	// 	this.io.in(data.room_name).emit('updateRoom', Room);
	// }

	
	private addMessageToRoom(message: MessageInterface): void {
		const roomId = message.roomId;
	
		if (this.chatRoomList[roomId]) {
		  if (!this.chatRoomList[roomId].messages) {
			this.chatRoomList[roomId].messages = [];
		  }
		  this.chatRoomList[roomId].messages?.push(message);
		  //console.log(`Message added to room ${roomId}:`, message);
		} else {
		  //console.error(`Room with ID ${roomId} not found`);
		}
	}

	private getInfoRoom(room: Rooms): void {
		//console.log("---- Info Room ----")
		//console.log(room);
		//console.log("---- Info Room ----")
	}
	
	private addDate(){
		const created = new Date();
		created.setHours(created.getHours() + 2)
		const timeString = created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    	//console.log("Message time:", timeString);
		return timeString;
	}

	private isBanned(roomId: string, userid: number){
		if (this.chatRoomList[roomId] && this.chatRoomList[roomId].banned && Array.isArray(this.chatRoomList[roomId].banned[userid])) {
			//console.log("You is banned: " + userid);
			return true;
		}
		//console.log("NOT banned: " + userid);
		return false;
	}

	private isMuted(roomId: string, userid: number, username: string){
		if (this.chatRoomList.muteList){
			if (this.chatRoomList.muteList[userid]){
				//console.log("ismuted")
				const now = new Date();
				const diff = (now.getTime() - this.chatRoomList.muteList[userid].getTime()) / 1000 / 60;
				//console.log(`now: ${now} diff: + ${diff}`)
				if (diff < 3) {
					//console.log("You is muted: " + userid);
					return true;
				}
				else
					delete this.chatRoomList.muteList[userid];
			}
			//console.log("NOT muted: " + userid);
		}
		return false;
	}

	private leaveSocket(socket: Socket){
		//console.log(`Leave socket ${socket.data.roomId}`)
		const temp_room_id = socket.data.roomId.toString();
		socket.leave(socket.data.roomId.toString());

		// leave the room
		// update the array
	}

	private joinArrayChats(socket: Socket, username: string, user_id: number) {
		Object.values(this.chatRoomList).forEach(room => {
		  if (room.users.includes(user_id) || room.status === 'public') {
			socket.join(room.id.toString());
			//console.log(`joinArrayChats User ${username} joined room ${room.name}`);
		  }
		});
	}

	private isOwner(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isOwner");
		if (Room && Room.owner === user_id){
			return true;
		}
		//console.log("not owner");
		return false;
	}

	private isAdmin(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isAdmin");
		if (Room && Room.admins.includes(user_id)){
			//console.log(`${user_id} is Admin in ${room_name}`);
			return true;
		}
		//console.log("not admin");
		return false;
	}

	private isPrivate(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isPrivate");
		if (Room && Room.status == "private"){
			//console.log(`${room_name} is private`);
			return true;
		}
		//console.log("not private");
		return false;
	}

	private isProtected(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isprotected");
		if (Room && Room.status == "protected"){
			//console.log(`${room_name} is protected`);
			return true;
		}
		//console.log("not protected");
		return false;
	}

	private findRoom(room_name: string, context: string): Rooms | undefined {
		const room = this.chatRoomList[room_name];
		if (!room) {
			//console.log(`findRoomById[${context}]the room doesnt exist`);
		}
		return room;
	}

	@SubscribeMessage('updateRoom') async updateRoom(
	@MessageBody() data: {user_id: number, user_name: string },
	@ConnectedSocket() client: Socket) 
	{	
		console.log(`updateRoom`);
		var temp : Record<string, Rooms> = {};
		Object.values(this.chatRoomList).forEach(room => {
			if (room.users.includes(data.user_id) || room.status == "public")
				temp[room.name] = room;
		});
		client.emit('getRoomss', temp);
		temp = {};
	}

	private createTestRooms() {
		// Create dummy rooms example
		const dummyRooms = [
			{ room_name: 'Global', status: 'public', password: '' },
			{ room_name: 'Help', status: 'public', password: '' },
			{ room_name: 'Private', status: 'private', password: '' },
			{ room_name: 'Protected', status: 'protected', password: '' },
		];
	
		dummyRooms.forEach((roomData) => {
		  const { room_name, status, password } = roomData;
	
		  this.chatRoomList[room_name] = {
			id: this.gateway_roomid,
			name: room_name,
			owner: 0,
			admins: [0],
			banned: [],
			muted: {},
			users: [77600], 
			status: status,
			password: password,
			messages: [],
		  };
	
		  this.gateway_roomid++;
		});
	}
}
