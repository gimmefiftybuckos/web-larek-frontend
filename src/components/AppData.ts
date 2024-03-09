import { IAppState, IOrder, IProduct } from '../types';
import { ensureAllElements } from '../utils/utils';
import { CatalogItem } from './Card';
import { Model } from './base/Model';

export class ProductItem extends Model<IProduct> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export class AppData extends Model<IAppState> {
	catalog: IProduct[];
	basket: IProduct[];
	order: IOrder | null;

	async setCatalog(items: IProduct[]) {
		// console.log('bebra', items);

		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	getPrice(container: CatalogItem[], value: string) {
		let totalAmount = 0;

		for (let i = 0; i < container.length; i++) {
			const currentAccount = container[i];
			totalAmount += currentAccount.price;
		}
		return totalAmount + value;
	}

	addProduct(item: CatalogItem, container: CatalogItem[]) {
		if (item) {
			// console.log(item);
			// console.log(container);
			container.push(item);
			// console.log(container);
		}
	}

	getProduct(container: HTMLElement[]) {
		return container;
	}
}
