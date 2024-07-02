export interface game{
	userid: number;
	userStatus: number; // 0-nothing, 1-searching/waitingforInvite, 2-playing
	uniquekey?: number;
	enemyid?: number; 
}

export interface gameresult{
	user1
	user2
	user3?
	user4?
	who won
	gamemode
}