import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CatalogItem } from './components/Card';
import { IProduct, ITotalItems } from './types';
import { Modal } from './components/common/Modal';

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
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const basketButton = document.querySelector('.header__basket');

basketButton.addEventListener('click', (event) => {
	event.preventDefault();
	events.emit('basket: open');
});

// Изменились элементы каталога
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		console.log(item);

		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: CDN_URL + item.image, // подумать: CDN на низком или на верхнем уровне (метод setImages)
			description: item.description,
			price: item.price,
			category: item.category,
		});
	});
});

events.on('card:select', (item: ProductItem) => {
	const card = new CatalogItem(cloneTemplate(selectedCardTemplate));
	modal.render({
		content: card.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			price: item.price,
			category: item.category,
		}),
	});
	console.log(card.price);
});

events.on('basket: open', () => {
	const card = new CatalogItem(cloneTemplate(basketCardTemplate));
	modal.render({
		content: card.render({
			title: card.title,
			price: card.price,
		}),
	});
});

api
	.get('/product')
	.then((data: ITotalItems<IProduct>) => appData.setCatalog(data.items))
	.catch((err) => {
		console.error(err);
	});
