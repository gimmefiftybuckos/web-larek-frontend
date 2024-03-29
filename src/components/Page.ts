import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

// Класс страницы приложения
export class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLElement>('.header__basket');

		this._basket.addEventListener('click', () => {
			this.events.emit('basket:render');
		});
	}

	// Счетчик элементов корзины
	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	// Элементы каталога
	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	// Блокировка скролла страницы
	set locked(value: boolean) {
		if (value) {
			document.body.classList.add('page__wrapper_locked');
		} else {
			document.body.classList.remove('page__wrapper_locked');
		}
	}
}
