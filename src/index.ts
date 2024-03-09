import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL, CDN_URL, catalogValue } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CatalogItem } from './components/Card';
import { IProduct, ITotalItems } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';

const events = new EventEmitter();
const api = new Api(API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const appData = new AppData({}, events); // принимает аргументы для Model

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const selectedCardTemplate =
	ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');

const order = new Order(cloneTemplate(orderTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

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

events.on('order:open', () => {
	modal.render({
		content: order.render({
			// email: '',
			// phone: '',
			// valid: false,
			// errors: [],
			valid: false,
			errors: '',
			address: '',
		}),
	});
	// order.enableValidation();
	// order.validateForm();
});

events.on('order:update', () => {
	modal.render({
		content: order.render({
			// email: '',
			// phone: '',
			// valid: false,
			// errors: [],
			valid: order.valid,
			errors: order.errors,
			// address: order.address,
		}),
	});
	// order.enableValidation();
	// order.validateForm();
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
