import { IsInt, IsString, IsAlphanumeric, IsNotEmpty, Length } from "class-validator";

export class CreateFriendIdRequestDto {
	@IsInt()
	sender: number;

	@IsInt()
	target: number;
}

export class CreateFriendNickRequestDto {
	@IsInt()
	sender: number;

	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	target: string;
}
