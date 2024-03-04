import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

export interface ICard {
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICard> {
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
		this._image = ensureElement<HTMLImageElement>(
			`.${blockName}__image`,
			container
		);
		this._button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__description`);
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
		value
			? this.setText(this._price, value + ' синапсов')
			: this.setText(this._price, 'Бесценно');
	}

	get price(): number {
		return parseInt(this._price.textContent);
	}

	set category(value: string) {
		const categoryClass = 'card__category_';
		this.setText(this._category, value);

		const categoryMap = new Map([
			['софт-скил', '_soft'],
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

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}
}

export class CatalogItem extends Card {
	// protected _status: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		// this._status = ensureElement<HTMLElement>(`.card__status`, container);
	}
}
