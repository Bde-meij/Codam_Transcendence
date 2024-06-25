import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TestingService } from './testing.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Loggary } from 'src/logger/logger.service';

// !! DO NOT MAKE CALLS TO THIS ENDPOINT FOR REASONS OTHER THAN TESTING !!
@Controller('testing')
export class TestingController {
	constructor(private readonly testingService: TestingService, private readonly userService: UserService, private loggary: Loggary) {}

	// Adds a single test user to the database
	@Post('user')
	async addUser(@Body() user: CreateUserDto): Promise<User> {
		this.loggary.verbose('addUser() adding user');
		return await this.userService.createUser(user);
	}

	// Adds an array of test users to the database
	@Post('users')
	async addUsers(@Body() users: CreateUserDto[]): Promise<User[]> {
		this.loggary.verbose('addUsers() adding users');
		var tempUsers: CreateUserDto[] = [];
		users.forEach(user => {
			tempUsers.push(user);
		});
		this.loggary.verbose(tempUsers);
		return await this.userService.createUsers(tempUsers);
	}
	
	@Post('user-update-roomkey/:userid/:key')
	async updateRoomKey(@Param('userid') userId: string, @Param('key') roomKey: string) {
		return await this.userService.updateRoomKey(userId, +roomKey);
	}

	// Gets a single user with the given id from the database
	@Get('user/:id')
	async getUser(@Param('id') id: string): Promise<User> {
		this.loggary.verbose('getUser() getting user');
		return await this.userService.findUserById(id);
	}
	
	// Gets an array of all users from the database
	@Get('user')
	async findAllUsers(): Promise <User[]> {
		this.loggary.verbose('findAllUsers() getting all users');
		return await this.userService.findAllUsers();
	}
}
