export interface game{
	userid: number;
	userStatus: number; // 0-nothing, 1-searching/waitingforInvite, 2-playing
	uniquekey?: number;
	enemyid?: number; 
}
