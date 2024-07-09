export interface FriendRequest {
	id: string;
	sender:	{
		id : string;
		nickname : string;
	};
	target:	{
		id : string;
		nickname : string;
	};
	status: string;		// "pending" or "accepted"
}

