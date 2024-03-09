// import {Form} from "./common/Form";
import { IOrderForm } from '../types';
import { EventEmitter, IEvents } from './base/events';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { Form } from './common/Form';

export class Order extends Form<IOrderForm> {
	protected _button: HTMLElement[];
	protected _order: HTMLElement;
	state: string;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._button = ensureAllElements<HTMLElement>(
			'.button_alt',
			this.container
		);

		this._order = this.container.querySelector('.order');

		if (this._button) {
			this._button.forEach((element) => {
				element.addEventListener('click', (event) => {
					this.toggleSelected(event.currentTarget as HTMLElement); // принуждаем ts принять его как HTMLElem
				});
			});
		}

		this.state = 'none';

		this.enableValidation();
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	toggleSelected(element: HTMLElement) {
		const activeBtn = this.container.querySelector('.button_alt-active');

		activeBtn
			? this.toggleClass(activeBtn as HTMLElement, 'button_alt-active')
			: null;
		this.toggleClass(element, 'button_alt-active');

		this.state = element.getAttribute('name');
	}

	enableValidation() {
		const inputs = Array.from(this._order.querySelectorAll('.form__input'));
		inputs.forEach((element) => {
			console.log(element);

			element.addEventListener('input', (event) => {
				this.checkInputValidation(event.target as HTMLInputElement);
			});
		});
		// console.log(inputs);
	}

	checkInputValidation(element: HTMLInputElement) {
		if (element.validity.valid) {
			console.log(true);
			this.valid = true;
			this.events.emit('order:update');
		} else {
			console.log(false);
		}
	}

	showError() {}
}
