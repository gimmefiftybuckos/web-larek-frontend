# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Документация проекта

### Типы данных

```ts
// Элементы в каталоге
interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Формы страницы заказа
interface IOrderForm {
	email: string;
	phone: string;
	address: string;
	payment: string;
	total: number;
	[key: string]: unknown; // позволяет использовать динамический ключ
}

// Объекты для заказа
interface IOrder extends IOrderForm {
	items: string[];
}

// Элементы приложения
interface IAppState {
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

interface IBasketView {
	items: HTMLElement[];
	price: string;
	selected: CatalogItem[];
}

// Получение элементов страницы
interface ITotalItems<T> {
	total: number;
	items: T[];
}

// Данные элементов католога для заказа
interface IOrderResult {
	id: string;
}

// Описание страницы
interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}
// Описание проверки форм
interface IFormState {
	valid: boolean;
	errors: string;
}

// Описание карточек страницы
interface ICard {
	id: string;
	index: number;
	description: string;
	image?: string;
	title: string;
	category: string;
	price: number | null;
}

// Описание страницы подтверждения
interface ISuccess {
	total: string;
}

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}
```

### Связующие классы

```ts
class Api {
	readonly baseUrl: string;
	protected options: RequestInit;

	protected handleResponse(response: Response): Promise<object>;

	async get(uri: string): IProduct[];

	async post(uri: string, data: object, method: ApiPostMethods = 'POST');
}

class EventEmitter implements IEvents {
	_events: Map<EventName, Set<Subscriber>>;

	/**
	 * Установить обработчик на событие
	 */
	on<T extends object>(eventName: EventName, callback: (event: T) => void);

	/**
	 * Снять обработчик с события
	 */
	off(eventName: EventName, callback: Subscriber);

	/**
	 * Инициировать событие с данными
	 */
	emit<T extends object>(eventName: string, data?: T);

	/**
	 * Слушать все события
	 */
	onAll(callback: (event: EmitterEvent) => void);

	/**
	 * Сбросить все обработчики
	 */
	offAll();

	/**
	 * Сделать коллбек триггер, генерирующий событие при вызове
	 */
	trigger<T extends object>(eventName: string, context?: Partial<T>);
}
```

### Модель данных

```ts
abstract class Model<T> {
	// Сообщить всем что модель поменялась
	emitChanges(event: string, payload?: object);
}

class AppData extends Model<IAppState> {
	catalog: IProduct[];
	basket: IProduct[];
	order: IOrder | null = {
		items: [],
		email: '',
		phone: '',
		address: '',
		payment: '',
		total: null,
	};

	// Заполнение католога
	async setCatalog(items: IProduct[]): void;

	// Получение данных о цене продуктов в корзине
	getPrice(container: CatalogItem[], value: string): string;

	// Добавление товара
	addProduct(item: CatalogItem, container: CatalogItem[]): void;

	// Очистка корзины
	clearBasket(container: CatalogItem[]): void;

	// Передача данных заказа перед отправкой
	setOrder(state: IOrder): void;
}
```

### Классы представления

```ts
// Базовый компонент
abstract class Component<T> {
	protected constructor(protected readonly container: HTMLElement);

	// Инструментарий для работы с DOM в дочерних компонентах

	// Переключить класс
	toggleClass(element: HTMLElement, className: string, force?: boolean): void;

	// Установить текстовое содержимое
	protected setText(element: HTMLElement, value: unknown): void;

	// Сменить статус блокировки
	setDisabled(element: HTMLElement, state: boolean): void;

	// Скрыть
	protected setHidden(element: HTMLElement): void;

	// Показать
	protected setVisible(element: HTMLElement): void;

	// Установить изображение с алтернативным текстом
	protected setImage(
		element: HTMLImageElement,
		src: string,
		alt?: string
	): void;

	// Вернуть корневой DOM-элемент
	render(data?: Partial<T>): HTMLElement;
}

// Класс страницы приложения
class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents);

	// Счетчик элементов корзины
	set counter(value: number): void;

	// Элементы каталога
	set catalog(items: HTMLElement[]): void;

	// Блокировка скролла страницы
	set locked(value: boolean): void;
}

// Класс для работы с элементами каталога
class Card extends Component<ICard> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	);

	// Проверка наличия элемента в корзине
	checkInBasket(item: ProductItem, container: CatalogItem[]);

	// Установить элемента страницы
	set index(value: string);

	// Установить индефикатор элемента
	set id(value: string);

	// Получение индефикатор
	get id(): string;

	// Установить заголовок товара
	set title(value: string);

	// Получение заголовка товара
	get title(): string;

	// Установить цену товара
	set price(value: number | null);

	// Получение цены товара
	get price(): number;

	// Установить категорию товара
	set category(value: string);

	// Установить изображение
	set image(value: string);

	// Установить описание
	set description(value: string);
}

// Класс для работы с корзиной магазина
class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLElement;

	selected: CatalogItem[]; // нет четкого понимания куда сохранить элементы для корзины
	total: string;

	constructor(container: HTMLElement, protected events: EventEmitter);

	// Установить элементы товара
	set items(items: HTMLElement[]);

	// Устновить стоимость товаров в корзине
	set price(price: string);

	// Получить стоимость товаров в корзине
	get price(): string;
}

// Класс для работы с данными заказа
class Order extends Form<IOrderForm> {
	protected _button: HTMLElement;
	protected _actions: HTMLElement;
	protected _paymentButton: HTMLElement[];
	protected _inputs: HTMLInputElement[];
	order: IOrder | null = {
		email: '',
		phone: '',
		address: '',
		payment: 'none',
		total: null,
		items: [],
	};

	constructor(container: HTMLFormElement, events: IEvents);

	// Установить номер телефона заказа
	set phone(value: string);

	// Установить почту заказа
	set email(value: string);

	// Установить адрес заказа
	set address(value: string);

	// Кнопки выбора способа оплаты
	protected toggleSelected(element: HTMLElement);

	// Обновление данных в стейте заказа
	protected setOrderFields();

	// Подключение валидации
	protected enableValidation();

	// Валидация инпутов
	protected checkInputValidation(element: HTMLInputElement);

	// Состояние кнопок выбор способа оплаты
	protected changeState(element?: HTMLInputElement);

	// Отображение элемента ошибки
	protected showError(element: HTMLInputElement);
}
```
