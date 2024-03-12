import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL, catalogValue } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CatalogItem } from './components/Card';
import { IOrderResult, IProduct, ITotalItems } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new Api(API_URL);

// Чтобы мониторить все события, для отладки
// events.onAll(({ eventName, data }) => {
// 	console.log(eventName, data);
// });

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const appData = new AppData({}, events); // принимает аргументы для Model

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const selectedCardTemplate =
	ensureElement<HTMLTemplateElement>('#card-preview');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const basket = new Basket(cloneTemplate(basketTemplate), events);
const address = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);

// Изменились элементы каталога
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
		});
	});
});

events.on('card:select', (item: ProductItem) => {
	const card = new CatalogItem(cloneTemplate(selectedCardTemplate), {
		onClick: (event) => {
			item.price !== null
				? events.emit('basket:change', item)
				: events.emit('basket:change');
		},
	});
	card.checkInBasket(item, basket.selected);
	modal.render({
		content: card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
		}),
	});
});

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

events.on('basket:delete', (item: ProductItem) => {
	basket.selected = basket.selected.filter((element) => {
		return element.id !== item.id;
	});
	events.emit('basket:change', null);
});

events.on('address:render', () => {
	modal.render({
		content: address.render({
			valid: address.valid,
			errors: address.errors,
			address: '',
		}),
	});
});

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

events.on('data:set', () => {
	let items: string[] = [];
	basket.selected.forEach((element) => {
		items.push(element.id);
	});
	appData.order.items = items;
	appData.order.address = address.order.payment;
	appData.order.payment = address.order.payment;
	appData.order.email = contacts.order.email;
	appData.order.phone = contacts.order.phone;
	appData.order.total = parseInt(basket.total);
}); // мне стыдно :/

events.on('order:submit', () => {
	events.emit('data:set');

	api
		.post('/order', appData.order)
		.then((data: IOrderResult) => data)
		.then(() => {
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
		})
		.catch((result) => {
			modal.close();
			console.error(result);
		});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.get('/product')
	.then((data: ITotalItems<IProduct>) => appData.setCatalog(data.items))
	.catch((err) => {
		console.error(err);
	});
