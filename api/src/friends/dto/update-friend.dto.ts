import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendRequestDto } from './create-friend.dto';

export class UpdateFriendDto extends PartialType(CreateFriendRequestDto) {}
