// import {Form} from "./common/Form";
import { IOrderForm } from '../types';
import { EventEmitter, IEvents } from './base/events';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { Form } from './common/Form';

export class Order extends Form<IOrderForm> {
	protected _button: HTMLElement;
	protected _actions: HTMLElement;
	protected _paymentButton: HTMLElement[];
	protected _inputs: HTMLInputElement[];
	paymentState: string;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._inputs = Array.from(this.container.querySelectorAll('.form__input'));

		this._actions = container.querySelector('.modal__actions');

		this._button = this._actions.querySelector('button');

		if (this._button.classList.contains('order__button')) {
			this._button.addEventListener('click', () => {
				events.emit('contacts:render');
				console.log('da');
			});
		} else {
			this._button.addEventListener('click', () => {
				events.emit('order:submit');
			});
		}

		this._paymentButton = ensureAllElements<HTMLElement>(
			'.button_alt',
			this.container
		);

		if (this._paymentButton) {
			this._paymentButton.forEach((element) => {
				element.addEventListener('click', (event) => {
					this.toggleSelected(event.currentTarget as HTMLElement); // принуждаем ts принять его как HTMLElem
				});
			});
		}

		this.paymentState = 'none';

		this.errors = '';

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

	protected toggleSelected(element: HTMLElement) {
		const activeBtn = this.container.querySelector('.button_alt-active');

		activeBtn
			? this.toggleClass(activeBtn as HTMLElement, 'button_alt-active')
			: null;
		this.toggleClass(element, 'button_alt-active');

		this.paymentState = element.getAttribute('name');

		this.changeState();
	}

	protected enableValidation() {
		this._inputs.forEach((element) => {
			element.addEventListener('input', (event) => {
				this.changeState(element);
			});
		});
		this.setHidden(this._errors);
	}

	protected checkInputValidation(element: HTMLInputElement) {
		if (element.validity.valid) {
			return true;
		} else {
			return false;
		}
	}

	protected changeState(element?: HTMLInputElement) {
		const value = this._inputs.map((element) => {
			if (element.value === '' || this.checkInputValidation(element) !== true) {
				return false;
			}
		});

		const validity = value.includes(false); // неограниченный скейл инпутов

		!validity && this.paymentState !== 'none'
			? (this.valid = true)
			: (this.valid = false);

		element ? this.showError(element) : null;
	}

	showError(element: HTMLInputElement) {
		console.log(element.validity);

		if (element.validity.valid) {
			this.setHidden(this._errors);
			this.errors = '';
		} else {
			element.validity.patternMismatch
				? (this.errors = element.dataset.errorMessage)
				: (this.errors = element.validationMessage);

			this.setVisible(this._errors);
		}
	}
}
