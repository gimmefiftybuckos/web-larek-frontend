import { Component } from '../base/Component';
import { createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';
import { CatalogItem } from '../Card';

interface IBasketView {
	items: HTMLElement[];
	price: string;
	selected: CatalogItem[];
}

// Корзина магазина
export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLElement;

	selected: CatalogItem[];
	total: string;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._price = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('address:render');
			});
		}

		this.selected = [];

		this.total = '';
	}

	// Определение состояния кнопки корзины
	protected setButtonStatus(price: string) {
		parseInt(price) === 0
			? this.setDisabled(this._button, true)
			: this.setDisabled(this._button, false);
	}

	// Установить элементы товара
	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	// Устновить стоимость товаров в корзине
	set price(price: string) {
		this.setText(this._price, price);
		this.setButtonStatus(price);
		this.total = price;
	}

	// Получить стоимость товаров в корзине
	get price(): string {
		return this.total;
	}
}
