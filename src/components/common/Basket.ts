import { Component } from '../base/Component';
import { createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
	price: number;
	selected: HTMLElement[];
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLElement;
	selected: HTMLElement[]; // нет четкого понимая куда сохранить элементы для корзины

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._price = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__action');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.items = [];

		this.selected = [];
	}

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

	set price(price: number) {
		this.setText(this._price, price);
	}
}
