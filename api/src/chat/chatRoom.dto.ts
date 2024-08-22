import { Type } from "class-transformer";
import { IsAlphanumeric, IsNumber, IsString, Length, IsNotEmpty, IsArray, IsOptional, IsBoolean, ValidateNested, Matches, IsEmpty } from "class-validator";
import { User } from "src/user/entities/user.entity";

export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface RoomInfo {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
}

export interface MessageInterface {
	message?: string;
	roomId: number;
	room_name: string;
	senderId: number;
	sender_name: string;
	created: Date;
	updated?: Date;
	game?: boolean;
	sender_avatar?: string;
	type: string;
	customMessageData?: {text: string, roomkey: number};
}

export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface ErrorMessage{
	msg: string;
	status_code: number;
	room?: string;
}

export class createRoomDto{
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room_name: string;
	@IsString()
	status: string;
	@IsString()
	@IsAlphanumeric()
	@Length(3, 13)
	@IsOptional()
	username?: string;
	@IsNumber()
	@IsOptional()
	userid?: number;
	@IsString()
	@IsOptional()
	// @IsNotEmpty()
	password: string;
	@IsBoolean()
	password_bool: boolean;
}

export class customMessageDto {
	@IsString()
	text: string;
	@IsNumber()
	roomkey: number;
}

export class messageDto{
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'Invalid input: Only alphanumeric characters, spaces, and limited punctuation are allowed.',
    })
	message: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	sender_name: string;
	@IsNumber()
	sender_id: number;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string;
	@IsString()
	type: string;
	@ValidateNested()
	@Type(() => customMessageDto)
	customMessageData: customMessageDto;
	@IsString()
	sender_avatar: string;
}

export class RoomDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	name: string;
	@IsString()
	@IsOptional()
	password: string; //true or false?
	@IsNumber()
	ownerId: number;
	@IsString()
	status: string;

}

export class DeleteRoomDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string;
	@IsNumber()
	userid: number;
}

export class CheckPasswordDto {
	@IsNumber()
	id: number;
	@IsString()
	password: string;
}

export class CheckPassworddDto {
	@IsNumber()
	roomid: number;
	@IsString()
	password: string;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	roomName: string;

}

export class UpdatePasswordDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room?: string;
	@IsNumber()
	id: number;
	@IsString()
	oldPassword: string;
	@IsString()
	newPassword: string;
}

export class UpdateNameDto {
	@IsNumber()
	id: number;
	@IsString()
	password: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	newName: string;
}

export class JoinRoomDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room_name: string;
	@IsNumber()
	user_id: number;
	@IsString()
	password: string;
	@IsString()
	avatar: string;
}

export class LeaveRoomDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string
	@IsNumber()
	roomid: number
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	username: string
	@IsNumber()
	userid: number
}

export class UserActionDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	username: string;
	@IsOptional()
	@IsString()
	avatar: string;
	@IsOptional()
	@IsNumber()
	userid: number;
}

export class InviteChatDto {
	@IsNumber()
	user: number;
}

export class InviteToChatDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	user: string;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	roomName: string;
	@IsNumber({allowNaN: false}, {
        message: 'isNumber can only contain numbers',
    })
	roomId: number;
}

export class AddRemAdminDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room_name: string;
	@IsNumber()
	userid: number;
	@IsString()
	avatar: string;
}

export class LastOpenRoomDto{
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	name: string;
}

export class giveUsernameDTO{
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string;
}

export class InviteGameDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room_name: string;
	@IsNumber()
	userid: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	userName: string;
}

export class JoinBattleDto {
	@IsNumber()
	numroom: number;
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	room: string;
	@IsString()
	avatar: string;
}

export class UpdateRoomDto {
	@IsNumber()
	user_id: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	user_name: string;
}

export class SettingsDto {
	@IsString()
	@Matches(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+=-]*$/, {
        message: 'room_name can only contain letters, numbers, and spaces',
    })
	roomName: string;
	@IsString()
	roomType: string;
	@IsString()
	@IsOptional()
	oldPassword: string;
	@IsString()
	@IsOptional()
	newPassword: string;
	@IsArray()
	admins: number[];
}

export class UpdateUsernameDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	sender_name: string;
}

export interface getAllUsersInRoomDTO{
	role: string;
	muted: boolean
	user: {
		id: number,
		nickname: string,
	}
}