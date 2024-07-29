import { IsAlphanumeric, IsInt, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
	@IsInt()
	id: number;

	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	nickname: string;
}
