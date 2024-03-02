import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CatalogItem } from './components/Card';
import { IProduct } from './types';

const events = new EventEmitter();
const api = new Api(API_URL);

const page = new Page(document.body, events);
const appData = new AppData({}, events); // принимает аргументы для Model

const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
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

	// page.counter = appData.getClosedLots().length;
});

api
	.get('/product')
	// .then((data) => console.log(data))
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
