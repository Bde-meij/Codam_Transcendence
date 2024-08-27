import { UsePipes, NotAcceptableException, Injectable, ValidationPipe, UseFilters, ArgumentsHost, Catch, HttpException, BadRequestException } from '@nestjs/common';
import { Rooms, RoomInfo, MessageInterface, RoomDto, messageDto, ErrorMessage, createRoomDto, CheckPasswordDto, UpdatePasswordDto, JoinRoomDto, LeaveRoomDto, DeleteRoomDto, UserActionDto, InviteChatDto, AddRemAdminDto, InviteGameDto, JoinBattleDto, UpdateRoomDto, SettingsDto, UpdateNameDto, UpdateUsernameDto, getAllUsersInRoomDTO, LastOpenRoomDto, InviteToChatDto, giveUsernameDTO, CheckPassworddDto } from './chatRoom.dto';
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
import { getNewRoomKey} from 'src/game/game.gateway';
import { BlockService } from 'src/block/block.service';
import { CreateBlockDto } from 'src/block/dto/create-block.dto';
import { DeleteBlockDto } from 'src/block/dto/delete-block.dto';
import { ChatRoomService } from './chatRoom.service';
import { WsExceptionFilter } from './exception';

var logger = 0;

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
	connectedUsers: string[] = [];
	system_id: number = -1;

	constructor(
				private chatService: ChatRoomService, 
				private blockService: BlockService, 
				private authService: AuthService, 
				private userService: UserService,
	) 
	{
		this.chatRoomList = {};
		this.connectedUsers = [];
	}

	afterInit() {
		this.createTestRooms();
		this.getIdDb();
	}

	async handleConnection(client: Socket) {
		try {
			this.logger("handleConnections: " + client.id + "connecting... with socket");
			const cookies = client.handshake.headers.cookie?.split('; ');
			if (!cookies)
				throw new NotAcceptableException();
			var token: string;
			for (var cookie of cookies) {
				const [key, value] = cookie.split('=');
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
			this.userService.updateStatus(user.id, "online");
			client.data.nickname = user.nickname;
			client.data.userid = (Number(user.id));
			client.data.room = '';
			if (!this.connectedUsers.includes(client.data.userid)){
				this.connectedUsers.push(client.data.userid);
			}
			else{
				this.logger("RELOADING");
				var p = this.findSocketUser(client.data.userid);
				(await p).emit('reload', true);
				client.disconnect();
				return;
			}
			this.getConnectedUsers();
			this.get_all_blocked(client.data.userid, client);
			this.updateRefresh(client, client.data.userid);
		} catch {
			this.logger(client.id, "connection refused");
			client.disconnect();
			return;
		}	
	}
	
	handleDisconnect(client: Socket) {
		this.logger("handleDisconnect()");
		const index = this.connectedUsers.indexOf(client.data.userid);
		this.userService.updateStatus(client.data.userid, "offline");
		if (index > -1) {
			this.connectedUsers.splice(index, 1);
			this.logger(`${client.data.userid} disconnected: ${client.data.nickname} on ${index} `);
		}
		client.disconnect();
		this.getConnectedUsers();
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('createRoom')
	async createRoom(
	@MessageBody() data: createRoomDto,
	@ConnectedSocket() socket: Socket
	){
		this.logger(data);
		const Room = Object.values(this.chatRoomList).find(
			(room_name) => room_name.name === data.room_name,
		);
		if (Room) {
			this.emit_error_message(socket, `Room '${data.room_name}' already exists, please pick another name`, 1, socket.data.room)
			this.logger("roomexists");
			return;
		}
		//this.logger("createRoom called: " + data.room_name);
		const roomdto: RoomDto = {name: data.room_name, password: data.password, ownerId: socket.data.userid, status: data.status}
		const CreateRoomDB: any =  await this.chatService.createChatRoom(roomdto)
		if (!CreateRoomDB){
			this.emit_error_message(socket, `Room '${data.room_name}' already exists in the database, please pick another name`, 1, socket.data.room)
			this.logger("already exists");
			return;
		}
		socket.data.name = data.room_name;
		this.chatRoomList[CreateRoomDB.id] = {
			id: CreateRoomDB.id,
			name: data.room_name,
			owner: socket.data.userid,
			admins: [socket.data.userid],
			banned: [],
			muted: {},
			users: [socket.data.userid],
			status: data.status,
			password: data.password_bool,
			messages: [], 
		};
		//unique room id from database.

		if (!this.chatRoomList[CreateRoomDB.id].users.includes(socket.data.userid))
			this.chatRoomList[CreateRoomDB.id].users.push(socket.data.userid);
		this.logger(`joining ${socket.data.id}`);
		this.logger(`joining ${this.chatRoomList[CreateRoomDB.id].id}`);
		//adding invite user
		var userid = null;
		var userSocket = null;
		if (data.username){
			userid = this.findUserId(data.username);
			userSocket = this.findSocketUser(userid);	
			this.join_room(userSocket, data.room_name, CreateRoomDB.id, 'owner', data.password);
		}
		socket.join(this.chatRoomList[CreateRoomDB.id].id.toString());
		this.logger("status", data.status);
		if (this.chatRoomList[CreateRoomDB.id].status == "public" || this.chatRoomList[CreateRoomDB.id].status == "protected"){
			this.logger("public room");
			this.update_public(CreateRoomDB.id);
		}
		this.update_client_rooms(CreateRoomDB.id, data.room_name);
		// socket.emit('getRoomss', this.chatRoomList);
		this.channelUserList(data.room_name);	

		this.logger("create room:")
		this.logger(this.chatRoomList[CreateRoomDB.id]);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('message')
	async handleMessage(
	@MessageBody() data: messageDto,
	@ConnectedSocket() socket: Socket,
	) {
		this.logger(this.chatRoomList[data.room]);
		this.logger(this.getConnectedUsers());

		if (socket.data.nickname != data.sender_name){
			// this.logger("change msg name ", socket.data.userid, data.sender_name)
			this.change_msg_name(socket.data.userid, data.sender_name);
			socket.data.nickname = data.sender_name
		}
		// this.name_changer(socket, data.sender_name);
		this.logger("handleMessage: " + data.room + ", by: " + socket.data.nickname + ", msg:", data.message);
		const Room = this.findRoom(data.room, "message");
		if (!Room){
			this.logger(`Room doesn't exist`);
			return;
		}
		if (!Room.users.includes(Number(data.sender_id))){
			this.logger(`handleMessage: not send ${data.sender_id} not in list ${Room.users} `);
			return;
		}
		this.logger("handleMessage: " + data.room + ", " + Room.id);
		this.logger(`users: ${this.chatRoomList[data.room].users}`)
		if (await this.isMuted(data.room, data.sender_id, data.sender_name)){
			this.emit_error_message(socket, "Can't send message, you are muted", 0, Room.id);
			this.logger("handleMessage: Ismuted");
			return;
		}
		if (this.isBanned(data.room, data.sender_id)){
			this.logger("handleMessage: Isbanned");
			this.emit_error_message(socket, "you're banned", 1, data.room);
			return;
		}
		const message: MessageInterface = {
			message: data.message,
			roomId: Room.id,
			room_name: Room.name,
			senderId: socket.data.userid,  // check 
			sender_name: socket.data.nickname,
			sender_avatar: "",
			created: new Date(),
			type: data.type,
			customMessageData: data.customMessageData
		};
		this.logger("room: " + data.room + ", socketdataid: " + socket.data.userid);
		this.logger("sending msg by ", socket.data.nickname);
		this.chatRoomList[Room.id].messages.push(message);
		this.io.to(Room.id.toString()).emit('message', message);
		// this.channelUserList(Room.name);
		this.get_all_blocked(socket.data.userid, socket);
	}

	async channelUserList(id: string) {
		const users = [];
		const sockets = await this.io.in(id).fetchSockets();
		if (!sockets)
			return;
		sockets.forEach((obj) => {
			users.push(obj.data.nickname);
		});
		this.io.to(id).emit('userList', users);
	}

	async getRoomsEmit(socket: Socket){
		const p = Array.from(socket.rooms).filter(item => item !== socket.id);
		socket.emit('getRooms', p);
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('joinRoom')
	async joinRoom(
	@MessageBody() data: JoinRoomDto,
	@ConnectedSocket() socket: Socket,
	) {
		this.logger("joinRoom: " + data.room_name + ", socketid: " + socket.data.userid + ", nickname:" + socket.data.nickname + ", room:"+ data.room_name);
		this.join_room(socket, data.room_name, data.roomid, 'user', data.password)
		return;
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('leaveRoom')
	async leaveRoom(
	@MessageBody() data: LeaveRoomDto,
	@ConnectedSocket() client: Socket) {
		this.leave_user(data.userid, client.data.nickname, data.roomid);
		client.emit("select", "");
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('deleteRoom')
	async deleteRoom(
	@MessageBody() data: DeleteRoomDto,
	@ConnectedSocket() client: Socket) {
		const user = await this.findSocketUser(client.data.userid);
		if (!user){
			this.logger("deleteRoom socket not found")
			return;
		}
		if (this.isOwner(data.userid, data.roomid)){
			const sockets = await this.io.in(data.roomid.toString()).fetchSockets();
			if (!sockets)
				return;
			this.io.to(data.roomid.toString()).emit('delete_room', data.roomid);
			for (const usersocket of sockets){
				this.logger(`${usersocket.data.nickname} will delete room`)
				usersocket.leave(data.roomid.toString());
			}
		}
		this.chatService.deleteChatRoom(data.roomid);
		this.delete_room(data.roomid, data.room);
		delete this.chatRoomList[data.room]
		this.update_client_rooms(data.roomid, data.room);
		this.logger("leaveroom succes");
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('mute') async mute(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket) 
	{
		const user = await this.userService.findUserByName(data.username)
		const userid = user.id;
		this.logger("mute " + userid + ", in: " + data.room);
		const room = this.findRoom(data.roomId, "mute");
		if (!room){
			return;
		}
		if (await this.isMuted(data.roomId, Number(userid), data.username)){
			const msg = this.create_msg(`${user.nickname} is already muted`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			if (this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.userid, data.roomId)){
				this.chatService.toggleMute(data.userid, room.id);
			}
			return;
		}
		if ((this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.userid, data.roomId ) && !this.isOwner(userid, data.roomId ) )){
			if (!room.muted){
				this.logger("room is not initialised");
			}
			room.muted[userid] = new Date();
			this.logger(`muted: ${room.name} ${userid}: ${room.muted[userid]}`)
			room.muted[userid].setMinutes(room.muted[userid].getMinutes() + 1);
			const msg = this.create_msg(`Muted user ${user.nickname} for 60 seconds`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			room.messages.push(msg);
			this.logger(`muted: ${room.name} ${userid}: ${room.muted[userid]} send to ${room.id.toString()}`)
			this.chatService.toggleMute(data.userid, room.id);
		}
		else{
			const msg = this.create_msg(`${user.nickname} not enough permissions.`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
		}
		this.update_client_rooms(room.id, room.name);

	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('unMute') async unMute(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket)
	{
		const room = this.findRoom(data.roomId, "unMute");
		if (!room){
			return;
		}
		if (this.isAdmin(client.data.userid, data.room) || this.isOwner(client.data.userid, data.roomId)){
			if (room.muted[data.userid]){
				delete room.muted[data.userid];
				const msg = this.create_msg(`unmuted user ${data.userid}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
				this.io.in(room.id.toString()).emit("message", msg)
			}
		}
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('ban') async ban(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket)
	{
		const user = await this.userService.findUserByName(data.username)
		const userid = user.id;
		this.logger("ban: " + userid + ", in: " + data.room )
		const room = this.findRoom(data.roomId, "ban");
		if (!room){
			this.logger("error room not found");
			return;
		}
		if (this.isOwner(Number(userid), room.id)){
			this.logger("user is owner, can't be banned");
			const msg = this.create_msg(`${data.username} can't be banned, he is the channel owner`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.in(room.id.toString()).emit("message", msg)
			return;
		}
		if (this.isAdmin(client.data.userid, room.id) || this.isOwner(client.data.userid, room.id)){
			this.logger("is authorized");
			this.chatRoomList[room.id].banned.push(Number(userid));
			const msg: MessageInterface = this.create_msg(`banned user ${data.username}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.kickUserId(Number(userid), room.id, room.name, msg, client)
			this.chatRoomList[room.id].users = this.chatRoomList[room.id].users.filter((item: number) => item !== Number(userid));
			const datas = { user_id : this.system_id, user_name: ""} ;
			this.chatService.banUser(userid, room.id);
			this.updateRoom(datas, client);
			this.channelUserList(room.id.toString());
			this.update_client_rooms(room.id, room.name);
			this.logger(`ban: ${this.chatRoomList[room.id].id.toString()}`)
		}
		else{
			this.logger("not admin or owner");
			return;
		}
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('unBan') async unban(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket)
	{
		this.unbanner(data.userid,data.username, client.data.userid, client.data.nickname, data.room, client);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('kick') async kick(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket) 
	{
		this.logger("kick: " + data.username + ", in: " + data.room )
		
		const room = this.findRoom(data.roomId, "kick");
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
		if ((this.isAdmin(client.data.userid, room.id) || this.isOwner(client.data.userid, room.id)) && !this.isOwner(userid, room.id)){
			this.logger("Authorized to kick");
			this.logger(room.users);
			const msg = this.create_msg(`kicked user ${data.username}`, room.id, room.name, client.data.userid, client.data.nickname, 'text', '')
			await this.kickUserId(Number(userid), room.id, room.name, msg, client)
		}
		else{
			const msg = this.create_msg(`${user.nickname} can't be kicked.`, room.id, room.name, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(room.id.toString()).emit('message', msg);
			return ;
		}
		this.update_client_rooms(room.id, room.name);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('block') async block(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket) 
	{
		const user = await this.userService.findUserByName(data.username)
		this.logger('blocking?');
		const blockResult: any = null;
		if (!user)
			return
		try{
			const blockResult = await this.blockService.createBlock({
				sender: client.data.userid, 
				target: user.id
			});
			this.emit_error_message(client, `${user.nickname} blocked`, 0, data.roomId)
			this.get_all_blocked(client.data.userid, client);
			this.logger(`user blocked`, blockResult);
		}
		catch(error){
			this.emit_error_message(client, `Can't block ${user.nickname} ${error}`, 0, data.roomId)
			this.logger(`block ${error}`);
			this.logger(`block error:`, blockResult);
		}
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('unblock') async unblock(
	@MessageBody() data: UserActionDto,
	@ConnectedSocket() client: Socket) 
	{
		const user = await this.userService.findUserByName(data.username)
		if (!user)
			return
		try{
			const blockResult = await this.blockService.deleteByUserId({
				sender: client.data.userid, 
				target: user.id
			});
			this.emit_error_message(client, `${user.nickname} unblocked`, 0, client.data.room)
			this.get_all_blocked(client.data.userid, client);

		}
		catch(error){
			this.emit_error_message(client, `Can't unblock ${user.nickname} ${error}`, 0, client.data.room)
			this.logger(`unblock ${error}`);
		}
	}

	private async kickUserId(userid: number, room_id: number, room_name: string, msg: MessageInterface, client: Socket){
		this.logger(`kickuserid: ${userid}: ${room_id}`)
		const target = await this.findSocketUser(userid);
		if (!target){
			msg.message = "couldn't kick target, not connected."
			this.io.in(room_id.toString()).emit("message", msg)
			this.chatRoomList[room_id].messages.push(msg);

			this.logger("kickUserId: couldn't kick target, not connected.");
			return false;
		}
		this.logger("kickUserId: targetnickname: " + target.data.nickname + " == userid: " + userid)
		this.io.in(room_id.toString()).emit("message", msg)
		this.chatRoomList[room_id].messages.push(msg);
		this.chatRoomList[room_id].users = this.chatRoomList[room_id].users.filter((item: number) => item !== target.data.userid);
		this.channelUserList(room_id.toString());
		this.update_client_rooms(room_id, room_name);
		target.leave(room_id.toString());
		this.logger(this.chatRoomList[room_id].users);
		this.chatService.removeUserFromChatRoom(target.data.userid, room_id);
		return true;
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('invite-to-chat') async inviteToChat(
	@MessageBody() data: InviteToChatDto,
	@ConnectedSocket() socket: Socket) 
	{
		this.logger("inviteToChat() invite-to-chat", data.user);
		const userid = await this.findUserId(data.user);
		if (!userid){
			this.emit_error_message(socket, 'User nor found', 0, data.roomId);
			return;
		}
		if (this.chatRoomList[data.roomId].users.includes(userid)){
			this.logger("User already in chatroom", data.user);
			this.emit_error_message(socket, 'User already in chatroom', 0, data.roomId);
			return;
		}
		var invitesocket = await this.findSocketUser(userid)
		if (!invitesocket){
			this.logger("cant find socket of invited user.", userid);
			return;
		}
		invitesocket.join(data.roomId.toString());
		this.chatRoomList[data.roomId].users.push(userid);
		const addUser = await this.chatService.addUserToChatRoom(userid, data.roomId, 'user');
		if (!addUser){
			this.logger("user not added to database.");
			return;
		}
		const msg: MessageInterface = {
			message: `${data.user} has been invited and joined the channel`,
			roomId: data.roomId,
			room_name: data.roomName,
			senderId: socket.data.userid,
			sender_name: socket.data.nickname,
			created: new Date(),
			type: 'text',
		}
		this.io.to(data.roomId.toString()).emit("message", msg);
		this.chatRoomList[data.roomId].messages.push(msg);
		await this.unbanner(userid, data.user, socket.data.userid, socket.data.username, data.roomId, socket);
		this.logger("user succesfully invited and joined the room.");
		this.update_client_rooms(data.roomId, data.roomName);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('inviteChat') async inviteChat(
	@MessageBody() data: InviteChatDto,
	@ConnectedSocket() socket: Socket) 
	{
		this.logger("getting invited for chat", data.user);
		const nametarget = await this.findUsername(Number(data.user));
		const nameroom = nametarget + socket.data.nickname;
		for (const roomId in this.chatRoomList) {
			const room = this.chatRoomList[roomId];
			if (room.users.length === 2 && room.status === 'private') {
				// Check if both the specified user and socket.user are in the room
				const hasBothUsers = room.users.includes(Number(socket.data.userid)) && room.users.includes(Number(data.user));
				// If all conditions are met, return or perform any action you want
				if (hasBothUsers) {
					this.logger(`Room ${room.name} matches the criteria.`);
					var invitesocket = await this.findSocketUser(Number(data.user))
					invitesocket.join(room.id.toString());
					socket.join(room.id.toString());
					var userAdded1 = await this.chatService.addUserToChatRoom(socket.data.userid, room.id, "owner")
					var userAdded2 = await this.chatService.addUserToChatRoom(data.user, room.id, "user")
					socket.emit("select", room.name);
					this.update_client_rooms(data.user, room.name);
					//emit room
					return;
				}
			}
		}
		const Room = Object.values(this.chatRoomList).find(
			(room_name) => room_name.name === nameroom,
		);
		if (Room) {
			this.emit_error_message(socket, `Room '${nameroom}' already exists, please pick another name`, 1, socket.data.room)
			return;
		}
		this.logger("createRoom called: " + nameroom);
		socket.data.id = -1;
		socket.data.name = nameroom;
		this.chatRoomList[nameroom] = {
			id: Number(data.user) + socket.data.userid,
			name: nameroom,
			owner: socket.data.userid,
			admins: [socket.data.userid],
			banned: [],
			muted: {},
			users: [socket.data.userid, data.user],
			status: "private",
			password: false,
			messages: [],
		};
		//unique room id from database.
		const roomdto: RoomDto = {name: nameroom, password: "", ownerId: socket.data.userid, status: "private"}
		const CreateRoomDB: any =  await this.chatService.createChatRoom(roomdto)
		if (!CreateRoomDB){
			this.emit_error_message(socket, `Room '${nameroom}' already exists in the database, please pick another name`, 1, socket.data.room)
			this.logger("already exist5,7 s");
			return;
		}
		this.chatRoomList[nameroom].id = CreateRoomDB.id;
		socket.data.id = CreateRoomDB.id;
		this.logger(`joining ${socket.data.id}`);
		this.logger(`joining ${this.chatRoomList[nameroom].id}`);
		
		socket.join(this.chatRoomList[nameroom].id.toString());
		const usersocket = await this.findSocketUser(data.user);
		usersocket.join(this.chatRoomList[nameroom].id.toString());
		var userAdded1 = await this.chatService.addUserToChatRoom(socket.data.userid, CreateRoomDB.id, "owner")
		var userAdded2 = await this.chatService.addUserToChatRoom(data.user, CreateRoomDB.id, "user")

		if (!userAdded1){
			this.logger("!useradded joinroom - room, user not found or user already in room.");
			return;
		}
		if (!userAdded2){
			this.logger("!useradded joinroom - room, user not found or user already in room.");
			return;
		}
		if (this.chatRoomList[nameroom].status == "public"){
			this.logger("public room");
			this.update_public(nameroom);
		}
		this.update_client_rooms(this.chatRoomList[nameroom].id, nameroom);
		socket.emit('getRoomss', this.chatRoomList);
		this.channelUserList(nameroom);	
		if (socket.data.room == nameroom)
			socket.emit("select", nameroom);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('addAdmin') async addAdmins(
	@MessageBody() data: AddRemAdminDto,
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

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('removeAdmin') async removeAdmins(
	@MessageBody() data: AddRemAdminDto,
	@ConnectedSocket() client: Socket) 
	{
		if (this.chatRoomList[data.room_name]){
			if (this.chatRoomList[data.room_name].admins.includes(data.userid)){
				this.logger("removing an admin");
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

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('inviteGame') async inviteGame(
	@MessageBody() data: InviteGameDto,
	@ConnectedSocket() client: Socket)
	{
		const roomKey = getNewRoomKey(); 
		this.logger(`InviteGame ${data.roomid} en ${roomKey}`)
		this.userService.updateRoomKey(client.data.userid, roomKey);
		this.logger("invitegame: " + client.data.userid + ", userid: " + data.userid);
		const message: MessageInterface = {
			//message: roomKey.toString(),
			roomId: data.roomid,
			room_name: data.room_name,
			senderId: data.userid, 
			sender_name: data.userName,
			created: new Date(),
			game: true,
			type: 'custom',
			customMessageData: {text: 'Join battle ', roomkey: roomKey},
		};
		this.logger("MESSAGE:", message);
		this.io.in(data.roomid.toString()).emit('message', message);
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('joinBattle') async joinBattle(
	@MessageBody() data: JoinBattleDto,
	@ConnectedSocket() client: Socket) 
	{
		this.logger("joinbattle: " + data.numroom + ", room: " + data.room);
		this.logger(data.numroom, "ITS JOINING THE PARTYYY");
		this.userService.updateRoomKey(client.data.userid.toString(), data.numroom)
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
		  this.logger(`Message added to room ${roomId}:`, message);
		} else {
		//   console.error(`Room with ID ${roomId} not found`);
		}
	}

	private getInfoRoom(room: Rooms): void {
		this.logger("---- START Info Room ----")
		this.logger(room);
		this.logger("---- END Info Room ----")
	}

	private isBanned(roomId: number, userid: number){
		if (this.chatRoomList[roomId] && this.chatRoomList[roomId].banned && Array.isArray(this.chatRoomList[roomId].banned[userid])) {
			return true;
		}
		return false;
	}

	private async isMuted(roomId: number, userid: number, username: string){
		this.logger (`ismuted param: ${roomId}, ${userid}, ${username}`);
		this.listMutedUsers(roomId);
		const muted_db = await this.chatService.checkMuted(userid, this.chatRoomList[roomId].id);
		if (muted_db == null){
			this.logger("isMuted() muted_db: null: ", muted_db);
			return;
		}
		this.logger("isMuted() muted_db:", muted_db);
		if (this.chatRoomList[roomId].muted){
			this.logger(`${this.chatRoomList[roomId].muted}`);
			if (this.chatRoomList[roomId].muted[userid]){
				const now = new Date();
				const diff = (now.getTime() - this.chatRoomList[roomId].muted[userid].getTime()) / 1000 / 60;
				this.logger(`now: ${now} diff: + ${diff}`)
				if (diff < 1) {
					return true;
				}
				else
					delete this.chatRoomList[roomId].muted[userid];
			}
			else
				this.logger("NOT muted: " + userid);
		}
		return false;
	}

	private leaveSocket(socket: Socket){
		//this.logger(`Leave socket ${socket.data.roomId}`)
		const temp_room_id = socket.data.roomId.toString();
		socket.leave(socket.data.roomId.toString());
	}

	private isOwner(user_id: number, room: number){
		const Room = this.findRoom(room, "isOwner");
		this.logger(Room);
		this.logger(user_id);
		this.logger(Room.owner);
		if (Room && Room.owner == user_id){
			this.logger("isowner: true");
			return true;
		}
		this.logger("isowner: false");
		return false;
	}

	private isAdmin(user_id: number, room_id: number){
		this.logger(`Admin?: ${this.chatRoomList[room_id].name} ${user_id}`)
		const Room = this.findRoom(room_id, "isAdmin");
		if (Room.admins.includes(user_id, 0))
			this.logger("admin found");
		if (Room && Room.admins.includes(user_id)){
			this.logger(`is Admin found room ${Room.name} ${Room.admins}`)
			//this.logger(`${user_id} is Admin in ${room_id}`);
			return true;
		}
		this.logger("not admin");
		return false;
	}

	private isPrivate(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isPrivate");
		if (Room && Room.status == "private"){
			return true;
		}
		return false;
	}

	private isProtected(user_id: number, room_name: string){
		const Room = this.findRoom(room_name, "isprotected");
		if (Room && Room.status == "protected"){
			return true;
		}
		return false;
	}

	private findRoom(roomid: number, context: string): Rooms | undefined {
		const room = this.chatRoomList[roomid];
		if (!room) {
			this.logger(`findRoomById[${context}]the room doesnt exist`);
		}
		return room;
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('updateRoom') async updateRoom(
	@MessageBody() data: UpdateRoomDto,
	@ConnectedSocket() client: Socket) 
	{	
		this.logger(`updateRoom`);
		this.get_all_blocked(client.data.userid, client);
		var temp : Record<string, Rooms> = {};
		Object.values(this.chatRoomList).forEach(room => {
			if (room.users.includes(data.user_id) || room.status == "public" || room.status == "protected")
				temp[room.name] = room;
			if (data.user_id == this.system_id){
				this.logger("updateroom system")
				this.updateAllUsers(client, this.chatRoomList);
				client.emit('getConnectedUsers', this.connectedUsers);
				return;
			}
		});
		this.joinArrayChats(client, client.data.nickname, client.data.userid);
		client.emit('getRoomss', temp);
		client.emit('getConnectedUsers', this.connectedUsers);
		temp = {};
	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('last_open_room') async last_open_room(
	@MessageBody() data: LastOpenRoomDto,
	@ConnectedSocket() client: Socket) 
	{
		this.logger("lastopenroom: ", data.name);
		if (this.chatRoomList[data.name])
			client.data.room = data.name;
	}

	@SubscribeMessage('give_usernames') async give_me_usernames(
	@MessageBody() room: giveUsernameDTO,
	@ConnectedSocket() client: Socket) 
	{	
		this.logger("give_me_usernames() give username of room:", room.room);
		const users: { user: string; username: string }[] = [];
		if (!this.chatRoomList[room.room]){
			this.logger("error givemeusername");
			return;
		}
		for (const user of this.chatRoomList[room.room].users) {
			let username = await this.findUsername(user);
			if (username){
				users.push({user: user.toString(), username: username});
			}
		}
		this.logger(users);
		client.emit('usernames', users);
	}
	
	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('settingsChat') async settingsChat(
	@MessageBody() data: SettingsDto,
	@ConnectedSocket() client: Socket) 
	{	
		// this.logger("status == " + status);
		let tempBoolPw = this.chatRoomList[data.roomId].password;
		if (!this.isOwner(client.data.userid, data.roomId))
			return;
		this.logger("settingsChat called: " + data.roomName + ", status: " + data.roomType + ", oldpassword: " + data.oldPassword + ", admins: " + data.admins);
		this.chatRoomList[data.roomId].status = data.roomType;
		this.chatRoomList[data.roomId].admins = data.admins;
		const updatePW: UpdatePasswordDto = {
			id: this.chatRoomList[data.roomId].id,
			oldPassword: data.oldPassword,
			newPassword: data.newPassword
		}
		if (data.newPassword != ''){
			this.chatRoomList[data.roomId].password = true;
			if (!await this.chatService.updatePassword(updatePW)){
				this.logger("updatepw error pw true");
				this.emit_error_message(client, `wrong password for ${data.roomName}, settings not changed`, 1, data.roomId);
				return;
			}
		} else{
			if (!await this.chatService.updatePassword(updatePW)){
				this.logger("updatepw error pw false");
				this.chatRoomList[data.roomId].password = false;
				this.emit_error_message(client, `wrong password for ${data.roomName}, settings not changed`, 1, data.roomId);
				return;
			}
		}
		if (data.roomType == "public"){
			this.update_public(data.roomId);
		}
		this.logger(`${tempBoolPw} and ${this.chatRoomList[data.roomId].password} what to do?`)
		this.update_client_rooms(this.chatRoomList[data.roomId].id, this.chatRoomList[data.roomId].name);
		if (data.oldPassword != data.newPassword || data.newPassword != '') {
			this.logger("kicking users from channel")
			const userPromises = this.chatRoomList[data.roomId].users.map(async user => {
				const username = await this.findUsername(user);
				if (user != client.data.userid)
					this.newPassword(user, username, data.roomId);
			});
			await Promise.all(userPromises);
		}
		this.logger("settings changed for:", this.chatRoomList[data.roomName].id, data.roomName);
		this.logger(this.chatRoomList[data.roomName]);
		this.update_client_rooms(this.chatRoomList[data.roomName].id, data.roomName);
		this.emit_error_message(client, `Settings changed for ${data.roomName}`, 1, data.roomName);


	}

	@UseFilters(WsExceptionFilter)
	@UsePipes(new ValidationPipe({ transform: true }))
	@SubscribeMessage('updateName') async check_name(
	@MessageBody() data: UpdateUsernameDto,
	@ConnectedSocket() socket: Socket)
	{	
		this.change_msg_name(socket.data.userid, data.sender_name);
		socket.data.nickname = data.sender_name
		// this.logger("new name: ", socket.data.nickname);
		
	}

	@SubscribeMessage('all_rooms') async all_rooms(
	@MessageBody()
	@ConnectedSocket() client: Socket) 
	{	
		this.logger('Send all rooms to client');
		this.updateAllUsers(client, this.chatRoomList)
	}

	@SubscribeMessage('checkPassword') async checkPassword(
	@MessageBody() data: CheckPassworddDto,
	@ConnectedSocket() client: Socket) 
	{
		this.logger("checkpassword:", data.password, "roomname:",data.roomName);
		const checkpw: CheckPasswordDto = {
			password: data.password,
			id: Number(data.roomid)
		}
		let pw_bool = await this.chatService.checkPassword(checkpw);
		if (pw_bool){
			//joinroom
			const isBanned = await this.chatService.checkBanned(client.data.userid, data.roomid);
			if (isBanned || this.chatRoomList[data.roomName].banned.includes(client.data.userid)){
				// this.logger("i am banned:", client.data.nickname);
				this.emit_error_message(client, "You're banned from this chat", 2, data.roomName);
				return;
			}
			this.logger("checkpassword: joining pw protected room");
			this.chatRoomList[data.roomName].users.push(client.data.userid)
			const msg: MessageInterface = this.create_msg(`${client.data.nickname} has joined the channel`, data.roomid, data.roomName, client.data.userid, client.data.nickname, 'text', client.data.avatar)
			this.io.to(data.roomid.toString()).emit("message", msg);
			this.chatRoomList[data.roomName].messages.push(msg)
			client.join(data.roomName);
			client.emit("update_client_room", this.chatRoomList[data.roomName]);
			client.emit("select", data.roomName);
			var userAdded = await this.chatService.addUserToChatRoom(client.data.userid, data.roomid, 'status')
			if (!userAdded){
				this.logger("!useradded joinroom - room, user not found or user already in room.");
				return;
			}
		}
		else{
			this.emit_error_message(client, "Wrong password", 0);
		}
		this.logger(checkpw);
		this.logger(pw_bool);
	}

	private update_public(roomid: number){
		this.io.emit("update_public", this.chatRoomList[roomid]);
	}

	private update_client_rooms(room_id: number, room_name: string){
		// this.logger("update_client_room");
		this.io.to(room_id.toString()).emit('update_client_room', this.chatRoomList[room_id]);
	}

	private updateAllUsers(socket: Socket, rooms: Record<string, Rooms>){
		this.io.emit('getRoomss', rooms);
	}

	private async updateRefresh(client: Socket, userid: number){{	
		this.logger("updaterefresh");
		// this.getIdDb();
		await this.get_all_blocked(userid, client);
		var temp : Record<string, Rooms> = {};
		Object.values(this.chatRoomList).forEach(room => {
			if (room.users.includes(userid) || room.status == "public" || room.status == "protected")
				temp[room.name] = room;
			if (room.users.includes(userid) || room.status == "public"){
				client.join(room.id.toString());
			}
		});
		client.emit('getRoomss', temp);
		client.emit('getConnectedUsers', this.connectedUsers);
		temp = {};
		}
	}

	private joinArrayChats(socket: Socket, username: string, user_id: number) {
		Object.values(this.chatRoomList).forEach(room => {
		  if (room.users.includes(user_id) && room.password == false) {
			socket.join(room.id.toString());
			this.update_client_rooms(this.chatRoomList[room.name].id, room.name);
		  }
		  if (room.status === 'public' && !room.banned.includes(user_id)){
			socket.join(room.id.toString());
			if (!room.users.includes(user_id))
				this.chatRoomList[room.name].users.push(user_id);
			this.update_client_rooms(this.chatRoomList[room.name].id, room.name);
		  }
		  else if (room.users.includes(user_id) && room.status === 'private'){
			socket.join(room.id.toString());
			if (!room.users.includes(user_id))
				this.chatRoomList[room.name].users.push(user_id);
			this.update_client_rooms(this.chatRoomList[room.name].id, room.name);
		  }
		});
	}

	private delete_room(room_id: number, room_name: string){
		if (!this.chatRoomList[room_id]){
			this.io.emit('delete_room', room_name);
		}
		return;
	}

	async findSocketUser(userid: number){
		// this.logger(`findSocketUser ${userid}`);
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			this.logger("findsocketuser:", socketId.data.userid);
			if (socketId.data.userid == userid){
				this.logger(`socket ${userid} found ${socketId.data.nickname}`);
				return socketId;
			}
		}
		return;
	}

	async findUsername(userid: number){
		// this.logger("findUsername");
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			if (socketId.data.userid == userid){
				return socketId.data.nickname
			}
		}
		this.logger("username not found");
	}

	async findUserId(username: string){
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			if (socketId.data.nickname == username){
				return socketId.data.userid
			}
		}
		this.logger("userid not found");
	}

	private emit_error_message(socket: Socket, msg: string, status_code: number, room?: number){
		
		const e_msg : ErrorMessage = {
			msg: msg,
			status_code: status_code,
			room: room,
		}
		socket.emit("error_message", e_msg);
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

	private change_owner(room: number, userid: number) : boolean{
		if (this.isOwner(userid, room)){
			if (this.chatRoomList[room].admins){
				const admin_owner = this.chatRoomList[room].admins.find(adminId => adminId !== userid) || null;
				if (!admin_owner){
					const user_owner = this.chatRoomList[room].users.find(adminId => adminId !== userid) || null;
					if (!user_owner){
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

	async block_user(send_user_id: number, target_user_id: number){
		const data: CreateBlockDto = {
			sender: send_user_id, 
			target: target_user_id
		}
		try{
			const blockResult = await this.blockService.createBlock(data);
			return true;
		}
		catch(error){
			this.logger("doesn't work");
		}
	}

	async unblock_user(send_user_id: number, target_user_id: number){
		const data: DeleteBlockDto = {
			sender: send_user_id, 
			target: target_user_id
		}
		try{
			const blockResult = await this.blockService.deleteByUserId(data);
		}
		catch(error){
			this.logger("doesnt work");
		}
	}

	async get_all_blocked(send_user_id: number, socket: Socket){
		try{
			const blockResult = await this.blockService.getAllBlocked(send_user_id);
			// this.logger("get all blocked", blockResult);
			socket.emit("blocked", blockResult);
		}
		catch(error){
			this.logger("doesnt work");
		}
	}
	
	listMutedUsers(roomId: number): void {
		const room = this.findRoom(roomId, 'listMutedUsers');
		if (!room.muted) {
			this.logger('No muted users.');
		  	return;
		}
		// this.logger('Muted users:');
		for (const [userid, muteDate] of Object.entries(room.muted)) {
			this.logger(`User ID: ${userid}, Muted Until: ${muteDate}`);
		}
	}

	async leave_user(userid: number, username: string, roomid: number){
		if (!this.chatRoomList[roomid])
			return;
		const user = await this.findSocketUser(userid);
		if (!user){
			this.logger("Leave_user socket not found: " + userid)
			return;
		}
		const msg: MessageInterface = this.create_msg(
			`${username} has left the room`,
			this.chatRoomList[roomid].id,
			this.chatRoomList[roomid].name,
			userid,
			username,
			'text',
			''
		)
		this.logger("leave_user room:", roomid + "name:", username + " id: ", this.chatRoomList[roomid].id.toString());
		this.io.to(roomid.toString()).emit("message", msg);
		this.chatRoomList[roomid].users = this.chatRoomList[roomid].users.filter((item: number) => item !== userid);
		this.chatRoomList[roomid].admins = this.chatRoomList[roomid].admins.filter((item: number) => item !== userid);
		user.leave(roomid.toString())
		this.chatRoomList[roomid].messages.push(msg);
		this.update_client_rooms(roomid, this.chatRoomList[roomid].name);
		this.chatService.removeUserFromChatRoom(userid, roomid)
		if (!this.change_owner(roomid, userid)){
			if (this.chatRoomList[roomid].users.length == 0){
				this.io.to(roomid.toString()).emit('delete_room', roomid);
				this.logger("room deleted cause owner left.");
				this.chatService.deleteChatRoom(this.chatRoomList[roomid].id)
				this.delete_room(this.chatRoomList[roomid].id, this.chatRoomList[roomid].name);
				delete this.chatRoomList[roomid];
			}
		} else{
			this.logger("owner changed");
		}
	}

	async newPassword(userid: number, username: string, roomId: number){
		const user = await this.findSocketUser(userid);
		if (!user){
			this.logger("LeaveRoom socket not found: " + userid)
			return;
		}
		if (!this.change_owner(roomId, userid)){
			this.logger("owner not changed");
			return ;
		}
		const msg: MessageInterface = this.create_msg(
			`${username} will need a new password`,
			this.chatRoomList[roomId].id,
			this.chatRoomList[roomId].name,
			userid,
			username,
			'text',
			''
		)
		this.io.to(this.chatRoomList[roomId].id.toString()).emit("message", msg);
		this.chatRoomList[roomId].users = this.chatRoomList[roomId].users.filter((item: number) => item !== userid);
		this.chatRoomList[roomId].admins = this.chatRoomList[roomId].admins.filter((item: number) => item !== userid);
		this.logger(`${username} has left ${roomId}`);
		user.leave(roomId.toString())
		this.chatService.removeUserFromChatRoom(user.data.userid, this.chatRoomList[roomId].id);
		this.update_client_rooms(roomId, this.chatRoomList[roomId].name);
	}

	async change_msg_name(userid: number, new_name: string){	
		Object.values(this.chatRoomList).forEach(room => {
			this.chatRoomList[room.id].messages.forEach(msg => {
				// this.logger(msg.sender_name);
				if (msg.senderId == userid){
					msg.sender_name = new_name;
				}
				this.logger(msg.sender_name);
			})
		});
		Object.values(this.chatRoomList).forEach(room => {
			if (this.chatRoomList[room.id].users.includes(userid)){
				// this.logger(`changemsgname ${room.name} ${room.id}`)
				this.update_client_rooms(room.id, room.name)
			}
		})
		this.logger("name changed");
	}

	private name_changer(socket: Socket, name: string){
		if (socket.data.name != name){
			// this.logger("changed name??");
			socket.data.name = name;
		}
	}

	private async isConnected(socket: Socket, userid: number, room: number){
		const sockets = await this.io.in(room.toString()).fetchSockets();
		for (const socketId of sockets) {
			if (socketId.data.userid == userid){
				// this.logger(`isConnected true: ${userid} found ${socketId.data.nickname} in ${room}`);
				return true;
			}
		}
		return false;
	}

	private logger(msg: any,msg1?: any,msg2?: any,msg3?: any){
		if (logger === 1){
			if (msg1 && msg2 && msg3){
				console.log(msg, msg1, msg2, msg3);
			}else if (msg1 && msg2){
				console.log(msg, msg1, msg2);
			}else if (msg1){
				console.log(msg, msg1);
			}else{
				console.log(msg);
			}
		}
	}
	
	private async join_room(socket: Socket, room_name: string, roomid: number, status: string,  password?: string){		
		this.logger("join_room: " + room_name + ", socketid: " + socket.data.userid + ", nickname:" + socket.data.nickname + ", room:"+ room_name);
		const room = this.findRoom(roomid, "joinRoom");
		if (!this.chatRoomList[roomid]){
			return;
		}
		this.logger("checking banned");
		const isBanned = await this.chatService.checkBanned(socket.data.userid, roomid);
		if (isBanned || this.chatRoomList[roomid].banned.includes(socket.data.userid)){
			this.logger("i am banned");
			this.emit_error_message(socket, "You're banned from this chat", 2, roomid);
			return;
		}
		// this.logger("checkbanned=",isBanned);
		if (room.users.includes(socket.data.userid)){
			this.logger("in userlist when joinroom");
			socket.join(room.id.toString());
			// this.update_client_rooms(roomid, room_name);
			if (await this.isConnected(socket, socket.data.userid, room.id)){
				this.logger("socket already connect and joined.");
				socket.data.room = room_name;
				// this.update_client_rooms(roomid, room_name);
				// socket.emit("select", room_name);
				return;
			}
		}
		let checkpw: CheckPasswordDto = { id: roomid, password: password }
		if (this.chatRoomList[roomid].status === 'protected' && !await this.chatService.checkPassword(checkpw)){
			this.logger("wrong password");
			// this.emit_error_message(socket, `wrong password for ${room_name}`, 0);
			return ;
		}
		this.logger("Valid pw");
		
		this.logger("params of addUserToChatRoom:", socket.data.userid, roomid, status);
		var userAdded = await this.chatService.addUserToChatRoom(socket.data.userid, roomid, status)
		if (!userAdded){
			// socket.join(room.id.toString());
			// this.chatRoomList[room_name].users.push(socket.data.userid);
			// socket.emit("select", room_name);
			this.logger("!useradded joinroom - room, user not found or user already in room.");
			return;
		}
		this.logger("joining room", room.id);

		socket.join(room.id.toString());
		const msg: MessageInterface = this.create_msg(`${socket.data.nickname} has joined the channel`, room.id, room.name, socket.data.userid, socket.data.nickname, 'text', socket.data.avatar)
		this.io.to(room.id.toString()).emit('message', msg);
		
		this.logger("sending users to clients");

		this.chatRoomList[roomid].users.push(socket.data.userid);
		this.chatRoomList[roomid].messages.push(msg);

		this.logger("sending users joinroom:")
		const users = this.chatService.getAllUsersInRoom(roomid);
		this.logger(users);

		this.io.to(roomid.toString()).emit('getConnectedUsers', this.connectedUsers);	
			
		this.update_client_rooms(room.id, room.name);
		socket.emit('update_client_room_messages', this.chatRoomList[roomid].messages, roomid);

		this.channelUserList(room.id.toString());
	}
	
	private async createTestRooms() {
		var id = 0;
		const dummyRooms = [
			{ room_name: 'Global', status: 'public', password: false, pw: ""},
			{ room_name: 'Help', status: 'public', password: false, pw: "" },
			{ room_name: 'Private', status: 'private', password: false, pw: "" },
			{ room_name: 'ProtectedNoPw', status: 'protected', password: true, pw: "pw" },
			{ room_name: 'Protected', status: 'protected', password: true, pw: "test" },
			{ room_name: 'Test', status: 'protected', password: true, pw: "test" },

		];
		for (const roomData of dummyRooms) {
			const { room_name, status, password, pw } = roomData;
			let chat = await this.chatService.createChatRoom({ ownerId:  0, name: room_name, password: pw, status: status})
			if (chat){
				id = chat.id;
			}
			this.chatRoomList[room_name] = {
				id: id,
				name: room_name,
				owner: 77600,
				admins: [],
				banned: [],
				muted: {},
				users: [],
				status: status,
				password: password,
				messages: [],
			};
		}
		this.chatRoomList["Global"].owner = 77600;
		this.chatRoomList["Global"].admins.push(77600);
	}

	private async getConnectedUsers(){
		const temp: number[] = [];
		const sockets = await this.io.fetchSockets();
		for (const socketId of sockets) {
			if (!this.connectedUsers.includes(socketId.data.userid) && socketId.data.userid){
				this.connectedUsers.push(socketId.data.userid);
			}
			temp.push(socketId.data.userid);
		}
		this.logger("getConnectedUsers:", temp);
		this.io.emit('getConnectedUsers', this.connectedUsers);
	}

	private async getIdDb() {
		var id = 0;
		const db_rooms = await this.chatService.getAllChatRooms();
		this.logger("get all rooms: getIdDb()")
		// this.logger(db_rooms);
		Object.values(this.chatRoomList).forEach(room => {
			// this.logger(room.id);
			db_rooms.forEach(db_room => {
				if (db_room.name == room.name) {
					this.chatRoomList[room.name].id = db_room.id;
				}
			})
		});

		for (const db_room of db_rooms){
			const Userinfo = await this.chatService.getAllUsersInRoom(db_room.id);
			// this.logger(Userinfo);
			var users = [];
			var admins = [];
			var muted = [];
			var banned = [];
			var owner = 0;
			for (const info of Userinfo){
				if (info.role === 'user' || info.role === 'admin' || info.role === 'owner')
					users.push(info.user.id);
				if (info.role === 'admin')
					admins.push(info.user.id);
				if (info.banned === true)
					banned.push(info.user.id);
				if (info.muted === true)
					muted.push(info.user.id);
				if (info.role === 'owner'){
					owner = info.user.id;
				}
			}
			var pw_bool = false;
			if (db_room.status === 'protected'){
				pw_bool = true;
			}
			if (db_room.name == 'Global'){
				owner = 77600;
			}
			this.chatRoomList[db_room.name] = {
				id: db_room.id,
				name: db_room.name,
				owner: owner,
				admins: admins,
				banned: banned,
				muted: {},
				users: users,
				status: db_room.status,
				password: pw_bool,
				messages: [], 
			};
			// this.logger(this.chatRoomList[db_room.name]);
		}
	}

	private async unbanner(userid: number, username: string, sender_id: number, sender_name: string, roomId: number, client: Socket){
		//this.logger("unBan: " + data.userid + ", in: " + data.room )
		
		const user = await this.userService.findUserByName(username)
		this.logger("unban: " + userid + ", in: " + roomId )
		const room: Rooms = this.findRoom(roomId, "unban");
		if (!room){
			this.logger("error room not found");
			return;
		}
		if (this.isOwner(Number(userid), roomId)){
			this.logger("user is owner, can't be unbanned");
			const msg = this.create_msg(`${username} can't be banned, he is the channel owner`, room.id, room.name, userid, sender_name, 'text', '')
			this.io.in(room.id.toString()).emit("message", msg)
			return;
		}
		if (this.isAdmin(sender_id, roomId) || this.isOwner(sender_id, roomId)){
			this.logger("is authorized");
			if (this.chatRoomList[roomId].banned.includes((Number(userid)))){
				this.chatRoomList[roomId].banned = this.chatRoomList[roomId].banned.filter(item => item !== (Number(userid)));
				this.chatService.unbanUser(userid, room.id);
				this.update_client_rooms(room.id, room.name);
			}
			else
				return;
			const name = this.findUsername(userid);
			const msg = this.create_msg(`unbanned user ${name}`, room.id, room.name, client.data.userid, client.data.sender_name, 'text', '')
			this.io.in(room.id.toString()).emit("message", msg)
			const datas = { user_id : this.system_id, user_name: ""} ;
			this.updateRoom(datas, client);
			this.channelUserList(roomId.toString());
			this.update_client_rooms(room.id, room.name);
		}
		else{
			this.logger("not admin or owner");
		}
	}
}
