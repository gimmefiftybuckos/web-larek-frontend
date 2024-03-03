export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: IProduct[];
}

export interface IOrderForm {
	email: string;
	phone: string;
}

export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	// preview: string | null;
	order: IOrder | null;
}

export interface ITotalItems<T> {
	total: number;
	items: T[];
}
