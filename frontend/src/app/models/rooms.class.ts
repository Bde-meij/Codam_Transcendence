export interface Rooms {
	id: number;
	name: string;
	status: string;
	users: string[];
	admins: string[];
	password: string;
}

const FAKE_ROOMS: Rooms[] = [
	{ id: 1, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 2, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 3, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 4, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 5, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 6, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 7, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 8, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
	{ id: 9, name: 'testroom', status: 'public', users: [], admins: [], password: ""  }
];