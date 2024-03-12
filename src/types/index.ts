import { CatalogItem } from '../components/Card';

// Элементы в каталоге
export interface IProduct {
	id: string;
	description: string;
	image: string;
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
	catalog: IProduct[];
	basket: string[];
	order: IOrder | null;

	// Заполнение католога
	setCatalog(items: IProduct[]): void;

	// Получение данных о цене продуктов в корзине
	getPrice(container: CatalogItem[], value: string): string;

	// Добавление товара
	addProduct(item: CatalogItem, container: CatalogItem[]): void;

	// Очистка корзины
	clearBasket(container: CatalogItem[]): void;

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
}
