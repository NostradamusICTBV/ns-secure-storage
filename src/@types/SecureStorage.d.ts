export type SetOptions = {
	accessGroup?: string;
	service?: string;
	key: string;
	value: string;
};

export type GetOptions = {
	accessGroup?: string;
	service?: string;
	key: string;
};

export type RemoveOptions = {
	accessGroup?: string;
	service?: string;
	key: string;
};

export type RemoveAllOptions = {
	service?: string;
};
