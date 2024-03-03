import { IAppState, IOrder, IProduct } from '../types';
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
	basket: string[];
	order: IOrder | null;

	async setCatalog(items: IProduct[]) {
		console.log('bebra', items);

		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}
}
