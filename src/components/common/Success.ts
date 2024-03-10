import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { catalogValue } from '../../utils/constants';

interface ISuccess {
	total: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLElement;
	protected _total: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	set total(value: number) {
		const resValue = 'Списано' + value + catalogValue;
		this.setText(this._total, resValue);
	}
}
