import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL, CDN_URL, catalogValue } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CatalogItem } from './components/Card';
import { ICard, IOrderResult, ITotalItems } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Success } from './components/common/Success';

// Корзина отображается по проекту, проверил в разных браузерах и на разных устройствах

const events = new EventEmitter();
const api = new Api(API_URL);

// Основные элементы
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const appData = new AppData({}, events); // принимает аргументы для Model

// Все темплейты
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const selectedCardTemplate =
	ensureElement<HTMLTemplateElement>('#card-preview');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Переиспользуемые компоненты
const basket = new Basket(cloneTemplate(basketTemplate), events);
const address = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Изменения элементов каталога
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: CDN_URL + item.image, // показалось что целый класс ради одной константы создавать не стоит, но не уверен
			description: item.description,
			price: item.price,
			category: item.category,
		});
	});
});

// Открытие карточки
events.on('card:select', (item: ProductItem) => {
	const card = new CatalogItem(cloneTemplate(selectedCardTemplate), {
		onClick: (event) => {
			item.price !== null
				? events.emit('basket:change', item)
				: events.emit('basket:change');
		},
	});
	modal.render({
		content: card.render({
			id: item.id,
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			price: item.price,
			category: item.category,
		}),
	});
	card.checkInBasket(item, basket.selected);
});

// Отрисовка корзины
events.on('basket:render', () => {
	modal.render({
		content: basket.render({
			items: basket.selected.map((element, index) => {
				return element.render({
					index: index + 1,
				});
			}),
			price: appData.getPrice(basket.selected, catalogValue), // не вышло реализовать через метод reduce
		}),
	});
});

// Обновление элементов корзины
events.on('basket:change', (item: ProductItem | null) => {
	// то как я воспринимаю эту работу: https://i.postimg.cc/HxyjBX0m/Untitled-1.jpg

	const cardTemplate = new CatalogItem(cloneTemplate(basketCardTemplate), {
		onClick: (event) => events.emit('basket:delete', item),
	});

	if (item !== null) {
		cardTemplate.render({
			id: item.id,
			title: item.title,
			price: item.price,
		});
		appData.addProduct(cardTemplate, basket.selected);
		modal.close();
	} else {
		events.emit('basket:render');
	}

	page.render({
		counter: basket.selected.length,
	});
});

// Удаление элементов из корзины
events.on('basket:delete', (item: ProductItem) => {
	basket.selected = basket.selected.filter((element) => {
		return element.id !== item.id;
	});
	events.emit('basket:change', null);
});

// Отрисовка страницы с адресом для заказа
events.on('address:render', () => {
	modal.render({
		content: address.render({
			valid: address.valid,
			errors: address.errors,
			address: '',
		}),
	});
});

// Отрисовка страницы с контактными данными для заказа
events.on('contacts:render', () => {
	modal.render({
		content: contacts.render({
			valid: contacts.valid,
			errors: contacts.errors,
			email: '',
			phone: '',
		}),
	});
	contacts.order.payment = address.order.payment;
});

// Формирование данных о заказе на отправку
events.on('data:set', () => {
	let items: string[] = [];
	basket.selected.forEach((element) => {
		items.push(element.id);
	});

	appData.setOrder({
		address: address.order.payment,
		payment: address.order.payment,
		phone: contacts.order.phone,
		items: items,
		email: contacts.order.email,
		total: parseInt(basket.total),
	});
});

// Отрисовка окна об успешном заказе
events.on('order:submit', () => {
	const success = new Success(cloneTemplate(successTemplate), {
		onClick: () => {
			appData.clearBasket(basket.selected);
			events.emit('basket:change', null);
			modal.close();
		},
	});

	modal.render({
		content: success.render({
			total: basket.price,
		}),
	});
});

// Отправка данных о заказе
events.on('order:post', () => {
	events.emit('data:set');

	api
		.post('/order', appData.order)
		.then((data: IOrderResult) => data)
		.then(() => {
			events.emit('order:submit');
		})
		.catch((result) => {
			modal.close();
			console.error(result);
		});
});

// Открытие модального окна
events.on('modal:open', () => {
	page.locked = true;
});

// Закрытие модального окна
events.on('modal:close', () => {
	page.locked = false;
});

// Получение данных для католога
api
	.get('/product')
	.then((data: ITotalItems<ICard>) => appData.setCatalog(data.items))
	.catch((err) => {
		console.error(err);
	});
