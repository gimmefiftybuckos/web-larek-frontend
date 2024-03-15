import { ICard } from '../types';
import { catalogValue, categoryMap } from '../utils/constants';
import { ensureElement } from '../utils/utils';
import { ProductItem } from './AppData';
import { Component } from './base/Component';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Класс для работы с элементами каталога
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

	// Проверка наличия элемента в корзине
	checkInBasket(item: ProductItem, container: CatalogItem[]) {
		this.setDisabled(this._button, false);
		this.setText(this._button, 'В корзину');

		container.forEach((element) => {
			if (item.id === element.id) {
				this.setDisabled(this._button, true);
				this.setText(this._button, 'Уже добавлено');
			}
		});
	}

	// Установить элемента страницы
	set index(value: string) {
		this.setText(this._index, value);
	}

	// Установить индефикатор элемента
	set id(value: string) {
		this.container.dataset.id = value;
	}

	// Получение индефикатор
	get id(): string {
		return this.container.dataset.id || '';
	}

	// Установить заголовок товара
	set title(value: string) {
		this.setText(this._title, value);
	}

	// Получение заголовка товара
	get title(): string {
		return this._title.textContent || '';
	}

	// Установить цену товара
	set price(value: number | null) {
		if (value) {
			this.setText(this._price, value + catalogValue);
		} else {
			this.setText(this._price, 'Бесценно');
			this._button ? this.setHidden(this._button) : null;
		}
	}

	// Получение цены товара
	get price(): number {
		return parseInt(this._price.textContent);
	}

	// Установить категорию товара
	set category(value: string) {
		const categoryClassName = 'card__category_';
		this.setText(this._category, value);

		this.toggleClass(
			this._category,
			categoryClassName + categoryMap.get(value)
		);
	}

	// Установить изображение
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	// Установить описание
	set description(value: string) {
		this.setText(this._description, value);
	}
}

export class CatalogItem extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}
}
