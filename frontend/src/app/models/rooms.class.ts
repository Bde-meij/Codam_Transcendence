export interface Rooms {
	id: string;
	name: string;
	owner: string;
	admins: string[];
	banned?: string[];
	
	muted?: string[];
	status: string; //public, private
	password: string; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface MessageInterface {
	message: string;
	roomId: string;
	senderId: number;
	created: string;
	updated?: Date;
}