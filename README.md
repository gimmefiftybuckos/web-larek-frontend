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
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm i
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

// Описание страницы подтверждения
interface ISuccess {
	total: string;
}

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}
```

### Базовый код

#### 1. Класс Api

Класс через который реализован обмен данными с сервером.

Конструктор принимает:

- baseUrl: string — основная ссылка на сервер
- options: RequesInit — параметры ссылки

#### 2. Класс Component<T>

Абстрактный класс, является дженериком и принимает в переменной T тип данных описываемого компонента приложения. Принимает темплейты компонентов приложения.

Сочетает в себе все основные методы для работы с DOM в дочерних компонентах.
Методы класс toggleClass, setText, setDisabled, setHidden, setVisible, setImage и render отвечают за отображение компонентов.

```ts
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
```

#### 3. Класс EventEmitter

Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков о наступлении события.

Класс имеет методы on , off , emit — для подписки на событие, отписки от события и уведомления подписчиков о наступлении события соответственно.

Дополнительно реализованы методы onAll и offAll — для подписки на все события и сброса всех подписчиков.

### Модель данных

#### 1. Класс AppData

Класс реализующий основные методы работы с данными, собирает все данные с компонентов.

Основные методы класса setCatalog, getPrice, addProduct, clearBasket, setOrder отвечают за передачу товаров между компонентами приложения.

```ts

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
```

### Классы представления

Представленные ниже классы расширяются классом Component<T>

#### 1. Класс Page

Класс реализует управление элементами главной страницы каталога.

#### 2. Класс Card

Класс для работы с элементами каталога, реализует отрисовку карточек товара в разных компонентах приложения.

Отрисовка карточек происходит за счет метода render, наследуемого от класса Component.

Метод checkInBasket позволяет корректно отобразить кнопку добавления товара в корзину.

Интерфейс ICard описывает все типы данных, обрабатываемые классом Card.

#### 3. Класс Basket

Данный класс управляет корзиной товаров. Принимает массив добавленных в корзину элементов каталога, определяют общую стоимость и отрисовывает их

Интерфейс IBasketView описывает все типы данных, обрабатываемые классом Basket.

#### 4. Класс Form<T>

Класс обрабатывает результаты ввода форм и передает информацию об результах валдиации и сообщение об ошибке.

#### 5. Класс Order

Расширяется классом Form<T>

Класс отвечает за обработку данных о заказе. Принимает введенные пользователем данные и заносит их в стейт для дальнейшей обработки.

Методы enableValidation, checkInputValidation, changeState, showError отвечают за валидацию введенных данных.

Методы toggleSelected, setOrderFields отвечают за обновление данных полей компонента

```ts
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
```

### События

- items:changed - произошло обновление элементов каталога
- card:select - карточка выбрана
- basket:render - корзина открыта
- basket:change - обновление товаров в корзине
- basket:delete - элемент удален из корзины
- address:render - открыта форма ввода адреса заказа
- contacts:render - открыта форма ввода контактных данных заказа
- data:set - данные о заказе собраны
- order:post - данные отправлены
- order:submit - заказ подтвержден
