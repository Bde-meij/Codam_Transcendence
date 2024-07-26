import { MatchType } from "../entities/match.entity";

export class CreateMatchDto {
	leftPlayerId: number;

	rightPlayerId: number;

	type: MatchType;
}
