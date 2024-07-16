import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CheckPasswordDto, DeleteRoomDto, RoomDto, UpdateNameDto, UpdatePasswordDto } from 'src/chat/chatRoom.dto';
import { User } from 'src/user/entities/user.entity';
import { FriendsService } from 'src/friends/friends.service';
import { CreateFriendRequestDto } from 'src/friends/dto/create-friend.dto';
import { FriendStatus } from 'src/friends/entities/friend.entity';
import { CreateBlockDto } from 'src/block/dto/create-block.dto';
import { BlockService } from 'src/block/block.service';
import { DeleteBlockDto } from 'src/block/dto/delete-block.dto';
import { CreateMatchDto } from 'src/game/dto/create-match.dto';
import { UpdateMatchDto } from 'src/game/dto/update-match.dto';
import { MatchService } from 'src/game/match.service';
import { ChatRoomService } from 'src/chat/chatRoom.service';

// !! DO NOT MAKE CALLS TO THIS ENDPOINT FOR REASONS OTHER THAN TESTING !!
@Controller('testing')
export class TestingController {
	constructor(private readonly userService: UserService, private readonly friendsService: FriendsService, private readonly blockService: BlockService, private readonly matchService: MatchService, private readonly chatRoomService: ChatRoomService) {}


	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// ----------------------------------------------TEST USER ENPOINTS----------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------

	// Adds a single test user to the database
	@Post('user')
	async addUser(@Body() user: CreateUserDto): Promise<User> {
		// console.log('addUser() adding user');
		return await this.userService.createUser(user);
	}

	// Adds an array of test users to the database
	@Post('users')
	async addUsers(@Body() users: CreateUserDto[]): Promise<User[]> {
		// console.log('addUsers() adding users');
		var tempUsers: CreateUserDto[] = [];
		users.forEach(user => {
			tempUsers.push(user);
		});
		// console.log(tempUsers);
		return await this.userService.createUsers(tempUsers);
	}
	
	@Post('user-update-roomkey/:userid/:key')
	async updateRoomKey(@Param('userid') userId: string, @Param('key') roomKey: string) {
		return await this.userService.updateRoomKey(userId, +roomKey);
	}

	// Gets a single user with the given id from the database
	@Get('user/:id')
	async getUser(@Param('id') id: string): Promise<User> {
		// console.log('getUser() getting user');
		return await this.userService.findUserById(id);
	}
	
	// Gets an array of all users from the database
	@Get('user')
	async findAllUsers(): Promise <User[]> {
		// console.log('findAllUsers() getting all users');
		return await this.userService.findAllUsers();
	}

	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// -------------------------------------------FRIEND REQUEST ENDPOINTS-------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------


	// send new friend request with friend id
	@Post('friends/new-request/:userid/:target')
	async createRequest_NoCookie(@Param('target') target: string, @Param('userid') userId: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: userId,
			target:	target
		}
		return await this.friendsService.create(friendRequest);
	}
	
	// delete friend request (accepted or not) with the friend request id
	@Delete('friends/delete-request-id/:userid/:requestid')
	async deleteRequestByRequestId_NoCookie(@Param('requestid') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.deleteByRequestId(userId, requestId);
	}
	
	// delete friend request (accepted or not) with the target user id
	@Delete('friends/delete-request-user/:userid/:targetid')
	async deleteRequestByUserId_NoCookie(@Param('targetid') targetId: string, @Param('userid') userId: string) {
		return await this.friendsService.deleteByUserId(userId, targetId);
	}
	
	// accept friend request with the friend request id
	@Post('friends/accept-request/:userid/:requestid')
	async acceptRequest_NoCookie(@Param('requestid') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.updateStatus(userId, requestId, FriendStatus.ACCEPTED);
	}

	// list with all incoming requests
	@Get('friends/incoming/:userid')
	async findIncomingRequests_NoCookie(@Param('userid') userId: string) {
		return await this.friendsService.findIncoming(userId);
	}
	
	// list with all outgoing requests
	@Get('friends/outgoing/:userid')
	async findOutgoingRequests_NoCookie(@Param('userid') userId: string) {
		return await this.friendsService.findOutgoing(userId);
	}

	// list with all your friends
	@Get('friends/all/:userid')
	async findFriends_NoCookie(@Param('userid') userId: string) {
		return await this.friendsService.findFriends(userId);
	}

	// check if this is friend
	@Get('friends/is-friends/:userid/:targetid')
	async isFriends_NoCookie(@Param('targetid') targetId: string, @Param('userid') userId: string) {
		return await this.friendsService.isFriendsUserId(userId, targetId);
	}
	
	
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------BLOCK ENDPOINTS-----------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	
	// list with all blocked users
	@Get('block/all-blocked/:userid')
	async getAllBlocked_NoCookie(@Param('userid') userId: string) {
		return await this.blockService.getAllBlocked(userId);
	}
	
	// check if target is blocked by sender
	@Get('block/is-blocked/:userid/:targetid')
	async isBlocked_NoCookie(@Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: CreateBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.isBlocked(block);
	}

	// create new block with user id
	@Post('block/new-block/:userid/:targetid')
	async createBlock_NoCookie(@Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: CreateBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.createBlock(block);
	}
	
	// delete block with block id
	@Delete('block/delete-block-id/:userid/:blockid')
	async deleteBlockByBlockId_NoCookie(@Param('blockid') blockId: string, @Param('userid') userId: string) {
		const block: DeleteBlockDto = {
			sender: userId,
			target: blockId,
		}
		return await this.blockService.deleteByBlockId(block);
	}
	
	// delete block with user id
	@Delete('block/delete-block-user/:userid/:targetid')
	async deleteBlockByUserId_NoCookie(@Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: DeleteBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.deleteByUserId(block);
	}

	
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------MATCH ENDPOINTS-----------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	
	// creates a match
	@Post('match/create')
	async createMatch(@Body() data: CreateMatchDto) {
		return await this.matchService.createMatch(data);
	}
	
	// updates a match score and sets the winner
	@Patch('match/update')
	async updateMatch(@Body() data: UpdateMatchDto) {
		return await this.matchService.updateMatch(data);
	}


	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// ----------------------------------------------CHATROOM ENDPOINTS----------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------

	// creates a chat room
	@Post('chatroom/create')
	async createChatRoom(@Body() data: RoomDto) {
		return await this.chatRoomService.createChatRoom(data);
	}

	// deletes a chat room
	@Delete('chatroom/delete')
	async deleteChatRoom(@Body() data: DeleteRoomDto) {
		return await this.chatRoomService.deleteChatRoom(data);
	}

	// checks is a password is correct
	@Post('chatroom/check-password')
	async checkPassword(@Body() data: CheckPasswordDto) {
		return await this.chatRoomService.checkPassword(data);
	}

	// updates a chat room password
	@Patch('chatroom/update-password')
	async updatePassword(@Body() data: UpdatePasswordDto) {
		return await this.chatRoomService.updatePassword(data);
	}
	
	// updates a chat room name
	@Patch('chatroom/update-name')
	async updateName(@Body() data: UpdateNameDto) {
		return await this.chatRoomService.updateName(data);
	}
}
