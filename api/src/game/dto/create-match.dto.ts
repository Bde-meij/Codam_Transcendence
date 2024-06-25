import { MatchType } from "../entities/match.entity";

export class CreateMatchDto {
	leftPlayerId: string;

	rightPlayerId: string;

	type: MatchType;
}
