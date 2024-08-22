import { MatchType } from "../entities/match.entity";

export class SaveMatchDto {
	leftPlayerId: number;

	rightPlayerId: number;

	leftPlayerScore: number;

	rightPlayerScore: number;
	
	type: MatchType;
}