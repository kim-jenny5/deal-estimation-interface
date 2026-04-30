import { PencilIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { strippedDate } from '@/util/formatters';
import { updateLineItem } from '@/util/queries';

import DrawerWrapper from '../DrawerWrapper';
import AddVerticalProductForm from './AddVerticalProductForm';
import LineItemForm from './LineItemForm';

type UpdateLineItemFormProps = {
	lineItem: {
		id: string;
		orderId: string;
		productId: string;
		name: string;
		startDate: string;
		endDate: string;
		rateType: string;
		rate: number;
		quantity: number;
	};
	products: { id: string; name: string }[];
};

type DrawerView = 'lineItem' | 'addProduct';

export default function UpdateLineItemForm({ lineItem, products }: UpdateLineItemFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [drawerView, setDrawerView] = useState<DrawerView>('lineItem');
	const [localProducts, setLocalProducts] = useState<{ id: string; name: string }[]>([]);
	const [productIdOverride, setProductIdOverride] = useState<string | null>(null);

	const allProducts = [
		...products,
		...localProducts.filter((lp) => !products.some((p) => p.id === lp.id)),
	].sort((a, b) => a.name.localeCompare(b.name));

	const initialValues = {
		productId: productIdOverride ?? lineItem.productId ?? '',
		name: lineItem.name ?? '',
		startDate: strippedDate(lineItem.startDate).toISODate() ?? '',
		endDate: lineItem.endDate ? (strippedDate(lineItem.endDate).toISODate() ?? '') : '',
		rateType: lineItem.rateType ?? '',
		rate: String(lineItem.rate ?? ''),
		quantity: String(lineItem.quantity ?? ''),
	};

	const handleClose = () => {
		setIsOpen(false);
		setDrawerView('lineItem');
		setProductIdOverride(null);
	};

	const handleProductCreated = (product: { id: string; name: string }) => {
		setLocalProducts((prev) => [...prev, product]);
		setProductIdOverride(product.id);
		setDrawerView('lineItem');
	};

	const drawerTitle = drawerView === 'addProduct' ? 'Add new product' : 'Edit line item';
	const drawerDescription =
		drawerView === 'addProduct'
			? 'Enter a product name to create a new product.'
			: 'Edit line item details below and click save when done.';

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='cursor-pointer rounded-full p-2 transition hover:scale-110 hover:bg-neutral-100 hover:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300'
			>
				<PencilIcon className='h-4.5 w-4.5' />
			</button>
			<DrawerWrapper
				isOpen={isOpen}
				onClose={handleClose}
				title={drawerTitle}
				description={drawerDescription}
			>
				{drawerView === 'addProduct' ? (
					<AddVerticalProductForm
						onComplete={handleProductCreated}
						onBack={() => setDrawerView('lineItem')}
					/>
				) : (
					<LineItemForm
						key={`${lineItem.id}-${productIdOverride}`}
						initialValues={initialValues}
						products={allProducts}
						submitFn={updateLineItem}
						extraData={{ id: lineItem.id }}
						closeDrawer={handleClose}
						resetKey={isOpen}
						submitLabel='Save'
						onAddProduct={() => setDrawerView('addProduct')}
					/>
				)}
			</DrawerWrapper>
		</>
	);
}
