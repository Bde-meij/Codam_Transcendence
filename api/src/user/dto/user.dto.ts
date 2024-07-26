import { IsAlphanumeric, IsNotEmpty, IsString, Length } from "class-validator";

export class NicknameDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	nickname: string;
}