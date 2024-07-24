import { Global, NotAcceptableException, Req } from '@nestjs/common';
import { Rooms, RoomInfo, MessageInterface, RoomDto } from './chatRoom.dto';
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
import { getNewRoomKey} from 'src/game/game.gateway';
import { BlockService } from 'src/block/block.service';
import { CreateBlockDto } from 'src/block/dto/create-block.dto';
import { DeleteBlockDto } from 'src/block/dto/delete-block.dto';
import { ChatRoomService } from './chatRoom.service';

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
	private connectedUsers: string[] = [];
	gateway_roomid: number;
	system_id: number = -1;

	constructor(
		private chatService: ChatRoomService, 
		private blockService: BlockService, 
		private authService: AuthService, 
		private userService: UserService
	) {
		this.chatRoomList = {};
		this.connectedUsers = [];
		this.gateway_roomid = 0;
	}

	afterInit() {
		//console.log("server initialized");
		this.createTestRooms();
		
	}

	async handleConnection(client: Socket) {
		try {
			console.log("handleConnections: " + client.id + "connecting...");
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
			// Update user status to online when connecting to the chat socket
			this.userService.updateStatus(user.id, "online");
			client.data.nickname = user.nickname;
			client.data.userid = (Number(user.id));
			if (this.connectedUsers.includes(client.data.userid)){
				console.log("already connected");
			}
			else
				console.log("not connected");
			this.joinArrayChats(client, client.data.nickname, client.data.userid);
			this.connectedUsers.push(client.data.userid);
			this.io.emit('getConnectedUsers', this.connectedUsers);
			client.emit('getRoomss', this.chatRoomList);
		} catch {
			console.log(client.id, "connection refused");
			client.disconnect();
			return;
		}	
	}
	
	handleDisconnect(client: any) {
		const userid = client.data.userid;
		const index = this.connectedUsers.indexOf(userid);
		// Update user status to offline when connecting to the chat socket
		this.userService.updateStatus(userid, "offline");
		if (index > -1) {
			this.connectedUsers.splice(index, 1);
			console.log(`${userid} disconnected: ${client.data.nickname} on ${index} `);
			//console.log(`Connected users: ${this.connectedUsers}`);
		}
		client.disconnect();
		this.io.emit('getConnectedUsers', this.connectedUsers);
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
			console.log("roomexists");
			socket.emit('Room already exists, please pick another name',);
			return;
		}
		//console.log("createRoom called: " + data.room_name);
		socket.data.id = this.gateway_roomid;
		socket.data.name = data.room_name;
		this.chatRoomList[data.room_name] = {
			id: this.gateway_roomid,
			name: data.room_name,
			owner: socket.data.userid,
			admins: [socket.data.userid],
			banned: [],
			muted: {},
			users: [socket.data.userid],
			status: data.status,
			password: false,
			messages: [], 
		};
		//console.log(`socket data nickname: ${socket.data.nickname} en ${socket.data.id} en ${socket.id}`);

		const CreateRoomDB: any =  await this.chatService.createChatRoom({name :  data.room_name, password: data.password })
		if (!CreateRoomDB){
			const msg = this.system_message(socket.data.userid, socket.data.username, "create_room", -1, "Room already exists");
			this.io.to("system_message").emit("create_room", msg);
			console.log("already exists");
			return;
		}
		this.chatRoomList[data.room_name].id = CreateRoomDB.id;
		socket.data.id = CreateRoomDB.id;
		this.chatRoomList[data.room_name].users.push(socket.data.userid);
		console.log(`joining ${socket.data.id}`);
		console.log(`joining ${this.chatRoomList[data.room_name].id}`);

		socket.join(this.chatRoomList[data.room_name].id.toString());
		if (this.chatRoomList[data.room_name].status == "public"){
			console.log("public room");
			this.update_public(data.room_name);
		}
		this.update_client_rooms(CreateRoomDB.id, data.room_name);
		socket.emit('getRoomss', this.chatRoomList);
		
		this.channelUserList(data.room_name);	
		this.gateway_roomid++;
		//console.log("Created room: " + socket.data.id)
	}

	@SubscribeMessage('createPrivateRoom')
	async createPrivateRoom(
	@MessageBody() data: { room_name: string; user: number, password: string },
	@ConnectedSocket() socket: Socket,
	) {
		//check if exists if so exit
		const Room = Object.values(this.chatRoomList).find(
			(room_name) => room_name.name === data.room_name,
		);
		if (Room) {
			console.log("roomexists");
			socket.emit('Room already exists, please pick another name',);
			return;
		}
		//console.log("createRoom called: " + data.room_name);
		socket.data.id = this.gateway_roomid;
		socket.data.name = data.room_name;
		this.chatRoomList[data.room_name] = {
			id: this.gateway_roomid,
			name: data.room_name,
			owner: socket.data.userid,
			admins: [socket.data.userid],
			banned: [],
			muted: {},
			users: [socket.data.userid][data.user],
			status: "private",
			password: false,
			messages: [], 
		};
		//console.log(`socket data nickname: ${socket.data.nickname} en ${socket.data.id} en ${socket.id}`);

		const CreateRoomDB: any =  await this.chatService.createChatRoom({name :  data.room_name, password: data.password })
		if (!CreateRoomDB){
			// const msg = this.system_message(socket.data.userid, socket.data.username, "create_room", -1, "Room already exists");
			// this.io.to("system_message").emit("create_room", msg);
			console.log("already exists");
			return;
		}
		this.chatRoomList[data.room_name].id = CreateRoomDB.id;
		socket.data.id = CreateRoomDB.id;
		this.chatRoomList[data.room_name].users.push(socket.data.userid);
		this.chatRoomList[data.room_name].users.push(data.user);
		console.log(`joining ${socket.data.id}`);
		console.log(`joining ${this.chatRoomList[data.room_name].id}`);

		socket.join(this.chatRoomList[data.room_name].id.toString());
		if (this.chatRoomList[data.room_name].status == "public"){
			console.log("public room");
			this.update_public(data.room_name);
		}
		this.update_client_rooms(CreateRoomDB.id, data.room_name);
		socket.emit('getRoomss', this.chatRoomList);
		this.channelUserList(data.room_name);	
		//console.log("Created room: " + socket.data.id)
	}

	// //console.log(chatRoom);
	// const chatRoom = this.chatRoomList[socket.data.id];
	// //console.log(chatRoom.users);
	@SubscribeMessage('message')
	async handleMessage(
	@MessageBody() data: { message: string, sender_name: string, sender_id: number, room: string, type: string, cutsomMessageData: {href: string, text: string}, sender_avatar: string },
	@ConnectedSocket() socket: Socket,
	) {
		if (socket.data.nickname != data.sender_name){
			console.log("change msg name ", socket.data.userid, data.sender_name)
			this.change_msg_name(socket.data.userid, data.sender_name);
			socket.data.nickname = data.sender_name
		}
		// this.name_changer(socket, data.sender_name);
		console.log("handleMessage: " + data.room + ", by: " + socket.id);
		const Room = this.findRoom(data.room, "message");
		if (!Room){
			console.log(`Room doesn't exist`);
			return;
		}
		if (!Room.users.includes(Number(data.sender_id))){
			console.log(`handleMessage: not send ${data.sender_id} not in list ${Room.users} `);
			return;
		}
		//console.log("handleMessage: " + data.room + ", " + Room.id);
		//console.log(`users: ${this.chatRoomList[data.room].users}`)
		if (this.isMuted(data.room, data.sender_id, data.sender_name)){
			// this.io.to(Room.id.toString()).emit('message', message);
			console.log("handleMessage: Ismuted");
			return;
		}
		if (this.isBanned(data.room, data.sender_id)){
			console.log("handleMessage: Isbanned");
		}
		const message: MessageInterface = {
			message: data.message,
			roomId: Room.id,
			room_name: data.room,
			senderId: socket.data.userid,  // check 
			sender_name: socket.data.nickname,
			sender_avatar: data.sender_avatar,
			created: new Date(),
			type: data.type,
			cutomMessageData: data.cutsomMessageData

		};
		// //console.log("room: " + data.room + ", socketdataid: " + socket.data.userid);
		// this.addDate();
		console.log("sending msg");
		this.chatRoomList[Room.name].messages.push(message);
		
		
	
		this.io.to(Room.id.toString()).emit('message', message);

		const msg =  message;
		
		// this.personal_messager(msg, socket.data.userid);

		this.channelUserList(Room.name);
		// this.logger(data.room);
		// this.findUsername(77600);
	}

	// const sockets = this.io.sockets.adapter.rooms.get(id);
	// const sockets = await this.io.of("/chat").in(id).allSockets();
	// //console.log("channelUserList: " + users);

	//room number
	async channelUserList(id: string) {
		const users = [];
		const sockets = await this.io.in(id).fetchSockets();
		if (!sockets)
		  return;
		sockets.forEach((obj) => {
			users.push(obj.data.nickname);
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
	@MessageBody() data: { room_name: string, user_id: number, password: string, avatar: string },
	@ConnectedSocket() socket: Socket,
	) {
		//console.log("joinRoom: " + data.room_name + ", socketid: " + socket.data.id + ", nickname:" + socket.data.nickname);
		const room = this.findRoom(data.room_name, "joinRoom");
		if (!this.chatRoomList[data.room_name]){
			//console.log(`the room does not exists.`);
			return;
		}
		if (this.chatRoomList[data.room_name].users.includes(socket.data.userid))
			return;
		//console.log(data.room_name);
		if (!this.isBanned(data.room_name, data.user_id)){
			socket.join(room.id.toString());
			const msg: MessageInterface = this.create_msg(`${socket.data.nickname} has joined the channel`, room.id, room.name, socket.data.userid, socket.data.nickname, 'text', socket.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			this.chatRoomList[data.room_name].users.push(socket.data.userid);
			this.chatRoomList[data.room_name].messages.push(msg);

			//console.log("joinedRoom: " + room.id + ", name: " + room.name + ", users: " + room.users);
			this.channelUserList(room.id.toString());
			const datas = { user_id : this.system_id, user_name: ""} ;
			this.updateRoom(datas, socket);
			this.update_client_rooms(room.id, room.name);
		}
		else
			console.log("banned, cant join room")
		this.logger(data.room_name);
	}
	
	@SubscribeMessage('leaveRoom')
	async leaveRoom(
	@MessageBody() data: { roomid: number, room: string; username: string, userid: number },
	@ConnectedSocket() client: Socket) {
		//console.log("-------LEAVEROOM:")
		//console.log(client.rooms);
		const user = await this.findSocketUser(client.data.userid);
		if (!user){
			console.log("LeaveRoom socket not found")
			return;
		}
		
		if (!this.change_owner(data.room, client.data.userid)){
			console.log("owner not changed????????");
			return ;
		}
		const msg: MessageInterface = this.create_msg(
			`Channel owner change to ${data.username}`,
			data.roomid,
			data.room,
			client.data.userid,
			data.username,
			'text',
			''
		)
		this.io.to(data.roomid.toString()).emit("message", msg);
		console.log(`userid ${client.data.userid}`)
		this.chatRoomList[data.room].users = this.chatRoomList[data.room].users.filter((item: number) => item !== client.data.userid);
		this.chatRoomList[data.room].admins = this.chatRoomList[data.room].admins.filter((item: number) => item !== client.data.userid);
		user.leave(data.room)
		this.update_client_rooms(data.roomid, data.room);
		// client.emit('getRoomss', this.chatRoomList);
		console.log("leaveroom succes");
	}

	@SubscribeMessage('deleteRoom')
	async deleteRoom(
	@MessageBody() data: { roomid: number, room: string; username: string, userid: number },
	@ConnectedSocket() client: Socket) {
		const user = await this.findSocketUser(client.data.userid);
		if (!user){
			console.log("deleteRoom socket not found")
			return;
		}
		
		if (this.isOwner(data.userid, data.room)){
			const sockets = await this.io.in(data.roomid.toString()).fetchSockets();
			if (!sockets)
				return;
			this.io.to(data.roomid.toString()).emit('delete_room', data.room);
			for (const usersocket of sockets){
				console.log(`${usersocket.data.nickname} will delete room`)
				usersocket.leave(data.roomid.toString())
			}
		}
		delete this.chatRoomList[data.room]
		this.update_client_rooms(data.roomid, data.room);
		// client.emit('getRoomss', this.chatRoomList);
		console.log("leaveroom succes");
	}

	@SubscribeMessage('changePassword') async changePassword(
	@MessageBody() data: { password: string; room: string; userid: number, username: string  },
	@ConnectedSocket() client: Socket) 
	{
		const room = this.findRoom(data.room, "changePassword");
		// if (this.isOwner(data.userid, data.room)){
		// 	this.chatRoomList[data.room].password = data.password;
		// 	this.io.to(room.id.toString()).emit('message', `Password changed`);
		// }
	}
	
	@SubscribeMessage('mute') async mute(
	@MessageBody() data: { room: string; username: string, avatar: string },
	@ConnectedSocket() client: Socket) 
	{
		const user = await this.userService.findUserByName(data.username)
		const userid = user.id;
		//check if room exists
		console.log("mute " + userid + ", in: " + data.room);
		const room = this.findRoom(data.room, "mute");
		if (this.isMuted(data.room, Number(userid), data.username)){
			const msg = this.create_msg(`${user.nickname} is already muted`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			return;
		}
		if (this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.user_id, data.room)){
			if (!room.muted){
				console.log("room is not initialised");
			}
			this.chatRoomList[data.room].muted[userid] = new Date();
			console.log(`muted: ${room.name} ${userid}: ${room.muted[userid]}`)
			this.chatRoomList[data.room].muted[userid].setMinutes(this.chatRoomList[data.room].muted[userid].getMinutes() + 1);
			const msg = this.create_msg(`Muted user ${user.nickname} for 60 seconds`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			console.log(`muted: ${room.name} ${userid}: ${room.muted[userid]} send to ${room.id.toString()}`)
		}
		else{
			const msg = this.create_msg(`${user.nickname} small can't mute big.`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
		}
	}

	@SubscribeMessage('unMute') async unMute(
	@MessageBody() data: { room: string; userid: number, username: string, avatar: string },
	@ConnectedSocket() client: Socket)
	{
		//check if room exists
		const room = this.findRoom(data.room, "unMute");
		if (this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.user_id, data.room)){
			if (this.chatRoomList[data.room].muted[data.userid]){
				delete this.chatRoomList[data.room].muted[data.userid];
				const msg = this.create_msg(`unmuted user ${data.userid}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
				this.io.in(room.id.toString()).emit("message", msg)
			}
		}
	}
	
	@SubscribeMessage('ban') async ban(
	@MessageBody() data: { room: string, username: string, avatar: string },
	@ConnectedSocket() client: Socket)
	{
		const user = await this.userService.findUserByName(data.username)
		const userid = user.id;
		console.log("ban: " + userid + ", in: " + data.room )
		const room = this.findRoom(data.room, "ban");
		if (!room){
			console.log("error room not found");
			return;
		}
		if (this.isOwner(Number(userid), data.room)){
			console.log("user is owner, can't be banned");
			const msg = this.create_msg(`${data.username} can't be banned, he is the channel owner`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.in(room.id.toString()).emit("message", msg)
			return;
		}
		if (this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.user_id, data.room)){
			console.log("is authorized");
			this.chatRoomList[data.room].banned.push(Number(userid));
			const msg: MessageInterface = this.create_msg(`banned user ${data.username}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.kickUserId(Number(userid), room.id, room.name, msg, client)
			this.chatRoomList[data.room].users = this.chatRoomList[data.room].users.filter((item: number) => item !== Number(userid));
			const datas = { user_id : this.system_id, user_name: ""} ;
			this.updateRoom(datas, client);
			this.channelUserList(data.room);
			
			console.log(`ban: ${this.chatRoomList[data.room].id.toString()}`)
		}
		else{
			console.log("not admin or owner");
			return;
		}
	}

	@SubscribeMessage('unBan') async unban(
	@MessageBody() data: { room: string; userid: number, username: string, avatar: string },
	@ConnectedSocket() client: Socket)
	{
		//console.log("unBan: " + data.userid + ", in: " + data.room )
		const room = this.findRoom(data.room, "Unban");
		if (this.isAdmin(data.userid, data.room) || this.isOwner(data.userid, data.room)){
			if (this.chatRoomList[data.room].banned.push((Number(data.userid)))){
				this.chatRoomList[data.room].banned = this.chatRoomList[data.room].banned.filter(item => item == (Number(data.userid)));
			}
			const name = this.findUsername(data.userid);
			const msg = this.create_msg(`unbanned user ${name}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.in(room.id.toString()).emit("message", msg)
		}
		//emit unban notification in chat
	}

	@SubscribeMessage('kick') async kick(
	@MessageBody() data: { room: string; username: string},
	@ConnectedSocket() client: Socket) 
	{
		console.log("kick: " + data.username + ", in: " + data.room )
		const room = this.findRoom(data.room, "kick");
		if (!room){
			return;
		}
		const user = await this.userService.findUserByName(data.username)
		if (!user){
			const msg = this.create_msg(`${data.username} does not exist, can't be kicked`, room.id, room.name, client.data.userid, client.data.nickname, 'text', '')
			this.io.in(room.id.toString()).emit("message", msg)
			return;
		}
		const userid = user.id;
		if (!room.users.includes(Number(userid))){
			const msg = this.create_msg(`User not in chatroom ${data.username}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', '')
			this.io.in(room.id.toString()).emit("message", msg)
			return;
		}
		if (this.isAdmin(Number(userid), data.room) || this.isOwner(Number(userid), data.room)){
			console.log("Authorized to kick");
			console.log(room.users);
			const msg = this.create_msg(`kicked user ${data.username}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', '')
			await this.kickUserId(Number(userid), room.id, room.name, msg, client)
		}
		else{
			const msg = this.create_msg(`${user.nickname} small can't kick big.`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			return ;
		}
	}

	@SubscribeMessage('block') async block(
	@MessageBody() data: { room: string; userid: number; },
	@ConnectedSocket() client: Socket) 
	{
		try{
			const blockResult = await this.blockService.createBlock({
				sender: client.data.userid.toString(), 
				target: data.userid.toString()
			});
			console.log(`user blocked`);
		}
		catch(error){
			console.log(`block ${error}`);
		}
	}

	@SubscribeMessage('unblock') async unblock(
	@MessageBody() data: { room: string; userid: number; },
	@ConnectedSocket() client: Socket) 
	{
		try{
			const blockResult = await this.blockService.deleteByUserId({
				sender: client.data.userid.toString(), 
				target: data.userid.toString()
			});
			console.log(`user unblocked`);
		}
		catch(error){
			console.log(`unblock ${error}`);
		}
	}

	private async kickUserId(userid: number, room_id: number, room_name: string, msg: MessageInterface, client: Socket){
		console.log(`kickuserid: ${userid}: ${room_id}`)
		const target = await this.findSocketUser(userid);
		if (!target){
			msg.message = "couldn't kick target, not connected."
			this.io.in(room_id.toString()).emit("message", msg)
			this.chatRoomList[room_name].messages.push(msg);

			console.log("kickUserId: couldn't kick target, not connected.");
			return false;
		}
		// console.log("kickUserId: targetnickname: " + target.data.nickname + " == userid: " + userid)
		this.io.in(room_id.toString()).emit("message", msg)
		this.chatRoomList[room_name].messages.push(msg);
		this.chatRoomList[room_name].users = this.chatRoomList[room_name].users.filter((item: number) => item !== target.data.userid);
		const datas = { user_id : this.system_id, user_name: ""} ;
		this.channelUserList(room_name);
		this.update_client_rooms(room_id, room_name);
		target.leave(room_id.toString());
		console.log(this.chatRoomList[room_name].users);
		return true;
	}


	@SubscribeMessage('joinPrivateRoom') async joinPrivateRoom(
	@MessageBody() data: { roomid: number; room_name: string, userid: number },
	@ConnectedSocket() client: Socket) 
	{

	}

	@SubscribeMessage('addAdmin') async addAdmins(
	@MessageBody() data: { roomid: number; room_name: string, userid: number, avatar: string },
	@ConnectedSocket() client: Socket) 
	{
		if (this.chatRoomList[data.room_name]){
			if (this.chatRoomList[data.room_name].admins.includes(data.userid)){
				const msg: MessageInterface = this.create_msg(`${data.userid} was already an admin.`, 
					data.roomid, 
					data.room_name, 
					client.data.userid, 
					client.data.nickname,
					'text',
					client.data.avatar
				);
				this.io.in(data.roomid.toString()).emit("message", msg)
			}
			else{
				const msg: MessageInterface = this.create_msg(`${data.userid} is an admin now.`, 
					data.roomid, 
					data.room_name, 
					client.data.userid, 
					client.data.nickname,
					'text',
					client.data.avatar
				);
				this.chatRoomList[data.room_name].admins.push(data.userid)
				this.io.in(data.roomid.toString()).emit("message", msg)
			}
		}
	}

	@SubscribeMessage('removeAdmin') async removeAdmins(
	@MessageBody() data: { roomid: number; room_name: string, userid: number, avatar: string },
	@ConnectedSocket() client: Socket) 
	{
		if (this.chatRoomList[data.room_name]){
			if (this.chatRoomList[data.room_name].admins.includes(data.userid)){
				console.log("removing an admin");
				this.chatRoomList[data.room_name].admins.filter((item: number) => item !== data.userid);
				const msg: MessageInterface = this.create_msg(`${data.userid} got removed as admin.`, data.roomid, data.room_name, client.data.userid, client.data.nickname, 'text', client.data.avatar);
				this.io.in(data.roomid.toString()).emit("message", msg)
			}
			else{
				const msg: MessageInterface = this.create_msg(`${data.userid} wasn't an admin.`, data.roomid, data.room_name, client.data.userid, client.data.nickname, 'text', client.data.avatar);
				this.io.in(data.roomid.toString()).emit("message", msg)
			}
		}
	}

	@SubscribeMessage('inviteGame') async inviteGame(
	@MessageBody() data: { roomid: number; room_name: string, userid: number, userName: string},
	@ConnectedSocket() client: Socket)
	{
		const roomKey = getNewRoomKey(); // nummer
		//console.log(`InviteGame ${data.roomid} en ${roomKey}`)
		this.userService.updateRoomKey(client.data.userid, roomKey);
		//console.log("invitegame: " + client.data.userid + ", userid: " + data.userid);
		const message: MessageInterface = {
			//message: roomKey.toString(),
			roomId: data.roomid,
			room_name: data.room_name,
			senderId: data.userid,  // check 
			sender_name: data.userName,
			created: new Date(),
			game: true,
			type: 'link',
			cutomMessageData: {href: '/dashboard/game', text: 'Join battle '},
		};
		this.io.in(data.roomid.toString()).emit('message', message);
	}

	@SubscribeMessage('joinBattle') async joinBattle(
	@MessageBody() data: { numroom: number, room: string, avatar: string },
	@ConnectedSocket() client: Socket) 
	{	
		console.log("joinbattle: " + data.numroom + ", room: " + data.room);
		this.userService.updateRoomKey(client.data.userid.toString(), Number(data.numroom))
		const room = this.findRoom(data.room, "kick");
		const msg = this.create_msg(`User ${client.data.nickname} joined the battle`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
		this.io.to(room.id.toString()).emit('message', msg);
	}

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
		//console.log("---- END Info Room ----")
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
		console.log (`ismuted param: ${roomId}, ${userid}, ${username}`);
		this.listMutedUsers(roomId);
		if (this.chatRoomList[roomId].muted){
			console.log(`${this.chatRoomList[roomId].muted}`);
			if (this.chatRoomList[roomId].muted[userid]){
				const now = new Date();
				const diff = (now.getTime() - this.chatRoomList[roomId].muted[userid].getTime()) / 1000 / 60;
				console.log(`now: ${now} diff: + ${diff}`)
				if (diff < 1) {
					return true;
				}
				else
					delete this.chatRoomList[roomId].muted[userid];
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
		  if (room.users.includes(user_id)) {
			socket.join(room.id.toString());
			//console .log(`joinArrayChats User ${username} joined room ${room.name}`);
		  }
		  else if (room.status === 'public' && !room.banned.includes(user_id)){
			socket.join(room.id.toString());
			this.chatRoomList[room.name].users.push(user_id);
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
		console.log(`Admin?: ${room_name} ${user_id}`)
		const Room = this.findRoom(room_name, "isAdmin");
		if (Room.admins.includes(user_id, 0))
			console.log("admin found");
		if (Room && Room.admins.includes(user_id)){
			console.log(`is Admin found room ${Room.name} ${Room.admins}`)
			//console.log(`${user_id} is Admin in ${room_name}`);
			return true;
		}
		console.log("not admin");
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
			console.log(`findRoomById[${context}]the room doesnt exist`);
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
			if (data.user_id == this.system_id){
				console.log("updateroom system")
				// this.findSocketUser(data.user_name);
				this.updateAllUsers(client, this.chatRoomList);
				client.emit('getConnectedUsers', this.connectedUsers);
				return;
			}
		});
		client.emit('getRoomss', temp);
		client.emit('getConnectedUsers', this.connectedUsers);
		temp = {};
	}

	@SubscribeMessage('all_rooms') async all_rooms(
	@MessageBody()
	@ConnectedSocket() client: Socket) 
	{	
		console.log('Send all rooms to client');
		this.updateAllUsers(client, this.chatRoomList)
	}

	@SubscribeMessage('client_update_room') async update_client_room(
	@MessageBody() data: {user_id: number, user_name: string },
	@ConnectedSocket() client: Socket) 
	{	
		console.log(`client_update_room`);
		var temp : Record<string, Rooms> = {};
		Object.values(this.chatRoomList).forEach(room => {
			if (room.users.includes(data.user_id) || room.status == "public")
				temp[room.name] = room;
			if (data.user_id == this.system_id){
				console.log("updateroom system")
				// this.findSocketUser(data.user_name);
				this.updateAllUsers(client, this.chatRoomList);
				client.emit('getConnectedUsers', this.connectedUsers);
				return;
			}
		});
		client.emit('getRoomss', temp);
		temp = {};
	}

	private update_public(room_name: string){
		this.io.emit("update_public", this.chatRoomList[room_name]);
	}

	private update_client_rooms(room_id: number, room_name: string){
		console.log("update_client_room");
		this.io.to(room_id.toString()).emit('update_client_room', this.chatRoomList[room_name]);
		// console.log(this.chatRoomList[room_name]);
	}

	private delete_room(room_id: number, room_name: string){
		if (!this.chatRoomList[room_name]){
			this.io.emit('delete_room', room_name);
		}
		return;
	}

	private updateAllUsers(socket: Socket, rooms: Record<string, Rooms>){
		this.io.emit('getRoomss', rooms);
		// this.logger();
	}

	private logger(room?: string){
		if (room){
			console.log(`LOG: ${this.chatRoomList[room].name}, ${this.chatRoomList[room].users}`)
		}
		else {
			Object.values(this.chatRoomList).forEach(room => {
				console.log(`LOG: ${room.name}, ${room.users}`);
			});
		}
	}

	async findSocketUser(userid: number){
		console.log(`findSocketUser ${userid}`);
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			if (socketId.data.userid == userid){
				console.log(`socket ${userid} found ${socketId.data.nickname}`);
				return socketId;
			}
		}
		return ;
	}

	async findUsername(userid: number){
		// console.log("findUsername");
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			if (socketId.data.userid == userid){
				return socketId.data.nickname
			}
		}
		console.log("notFoundUsername");
	}

	private remove_num_array(target_num: number, array: number[])
	{
		array = array.filter((item: number) => item !== target_num);
		return array;
	}

	private create_msg(msg: string, room_id : number, room_name : string, sender_id : number, sender_name: string, type: string, sender_avatar: string){
		const message: MessageInterface = {
			message: msg,
			roomId: room_id,
			room_name: room_name,
			senderId: sender_id,  // check 
			sender_name: sender_name,
			created: new Date(),
			type: type
		};
		return message
	}

	private change_owner(room: string, userid: number) : boolean{
		if (this.isOwner(userid, room)){
			if (this.chatRoomList[room].admins){
				const admin_owner = this.chatRoomList[room].admins.find(adminId => adminId !== userid) || null;
				if (!admin_owner){
					const user_owner = this.chatRoomList[room].users.find(adminId => adminId !== userid) || null;
					if (!user_owner){
						delete this.chatRoomList[room];
						return false;
					}
					this.chatRoomList[room].owner = user_owner;
					return true;
				}
				this.chatRoomList[room].owner = admin_owner;
				return true
			}
		}
		return false
	}

	private system_message(client_id: number, client_name: string, 
							room_name: string, room_id, msg: string){
		const message: MessageInterface = this.create_msg(msg, room_id, room_name, client_id, client_name, 'text', '');
		this.io.to(room_id.toString()).emit('system_message', message);
	}

	private personal_messager(msg: MessageInterface, userid: number){
		console.log("personal messager");
		const babe : MessageInterface = this.create_msg("personal messager", msg.roomId, msg.room_name, msg.senderId, msg.sender_name, msg.type, msg.sender_avatar);
		const room = (userid.toString()) + "_listen";
		console.log(room);
		this.io.to(room).emit('message', babe);
	}

	async block_user(send_user_id: number, target_user_id: number){
		const data: CreateBlockDto = {
			sender: send_user_id.toString(), 
			target: target_user_id.toString()
		}
		try{
			const blockResult = await this.blockService.createBlock(data);
		}
		catch(error){
			console.log("doesn't work");
		}
	}

	async unblock_user(send_user_id: number, target_user_id: number){
		const data: DeleteBlockDto = {
			sender: send_user_id.toString(), 
			target: target_user_id.toString()
		}
		try{
			const blockResult = await this.blockService.deleteByUserId(data);
		}
		catch(error){
			console.log("doesnt work");
		}
	}

	listMutedUsers(roomId: string): void {
		const room = this.findRoom(roomId, 'listMutedUsers');
		if (!room.muted) {
		  console.log('No muted users.');
		  return;
		}
		console.log('Muted users:');
		for (const [userid, muteDate] of Object.entries(room.muted)) {
		  console.log(`User ID: ${userid}, Muted Until: ${muteDate}`);
		}
	}


	async change_msg_name(userid: number, new_name: string){	
		Object.values(this.chatRoomList).forEach(room => {
			this.chatRoomList[room.name].messages.forEach(msg => {
				console.log(msg.sender_name);
				if (msg.senderId == userid){
					msg.sender_name = new_name;
				}
				console.log(msg.sender_name);
			})
		});
		Object.values(this.chatRoomList).forEach(room => {
			if (this.chatRoomList[room.name].users.includes(userid)){
				console.log(`changemsgname ${room.name} ${room.id}`)
				this.update_client_rooms(room.id, room.name)
			}
		})
	}

	private name_changer(socket: Socket, name: string){
		if (socket.data.name != name){
			console.log("changed name??");
			socket.data.name = name;
		}
	}


	private createTestRooms() {
		// Create dummy rooms example
		const dummyRooms = [
			{ room_name: 'Global', status: 'public', password: false },
			{ room_name: 'Help', status: 'public', password: false },
			{ room_name: 'Private', status: 'private', password: false },
			{ room_name: 'Protected', status: 'protected', password: false },
		];
	
		dummyRooms.forEach((roomData) => {
		  const { room_name, status, password } = roomData;
	
		  this.chatRoomList[room_name] = {
			id: this.gateway_roomid,
			name: room_name,
			owner: 77600,
			admins: [77600],
			banned: [],
			muted: {},
			users: [1, 2, 3], 
			status: status,
			password: password,
			messages: [],
		  };
	
		  this.gateway_roomid++;
		});
	}
}
