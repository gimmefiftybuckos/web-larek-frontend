// Элементы в каталоге
export interface ICard {
	// было много интерфейсов, которые дублировали друг друга
	id: string;
	index?: number;
	description: string;
	image?: string;
	title: string;
	category: string;
	price: number | null;
}

// Формы страницы заказа
export interface IOrderForm {
	email: string;
	phone: string;
	address: string;
	payment: string;
	total: number;
	[key: string]: unknown; // позволяет использовать динамический ключ
}

// Объекты для заказа
export interface IOrder extends IOrderForm {
	items: string[];
}

// Элементы приложения
export interface IAppState {
	catalog: ICard[];
	basket: string[];
	order: IOrder | null;

	// Заполнение католога
	setCatalog(items: ICard[]): void;

	// Получение данных о цене продуктов в корзине
	getPrice(container: ICard[], value: string): string;

	// Добавление товара
	addProduct(item: ICard, container: ICard[]): void;

	// Очистка корзины
	clearBasket(container: ICard[]): void;

	// Передача данных заказа перед отправкой
	setOrder(state: IOrder): void;
}

// Получение элементов страницы
export interface ITotalItems<T> {
	total: number;
	items: T[];
}

// Данные элементов католога для заказа
export interface IOrderResult {
	id: string;
	total: number;
}

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};
