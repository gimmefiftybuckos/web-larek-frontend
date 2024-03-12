import { catalogValue } from '../utils/constants';
import { ensureElement } from '../utils/utils';
import { ProductItem } from './AppData';
import { Component } from './base/Component';

export interface ICard {
	id: string;
	index: number;
	description: string;
	image?: string;
	title: string;
	category: string;
	price: number | null;
}

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICard> {
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
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);

		container.querySelector(`.${blockName}__image`)
			? (this._image = ensureElement<HTMLImageElement>(
					`.${blockName}__image`,
					container
			  ))
			: null;

		this._index = container.querySelector(`.${blockName}__index`);
		this._button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__text`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._category = container.querySelector(`.${blockName}__category`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	checkInBasket(item: ProductItem, container: CatalogItem[]) {
		container.map((element) => {
			if (item.id === element.id) {
				this.setDisabled(this._button, true);
				this.setText(this._button, 'Уже добавлено');
			} else {
				this.setDisabled(this._button, false);
				this.setText(this._button, 'В корзину');
			}
		});
	}

	set index(value: string) {
		this.setText(this._index, value);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number | null) {
		if (value) {
			this.setText(this._price, value + catalogValue);
		} else {
			this.setText(this._price, 'Бесценно');
			this._button ? this.setHidden(this._button) : null;
		}
	}

	get price(): number {
		return parseInt(this._price.textContent);
	}

	set category(value: string) {
		const categoryClass = 'card__category_';
		this.setText(this._category, value);

		const categoryMap = new Map([
			// наверное, это не совсем по ООП
			['софт-скил', 'soft'],
			['другое', 'other'],
			['дополнительное', 'additional'],
			['кнопка', 'button'],
			['хард-скил', 'hard'],
		]);

		this.toggleClass(this._category, categoryClass + categoryMap.get(value));
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}

export class CatalogItem extends Card {
	// protected _status: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		// this._status = ensureElement<HTMLElement>(`.card__status`, container);
	}
}
