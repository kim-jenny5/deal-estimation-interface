import { faker } from '@faker-js/faker';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DateTime } from 'luxon';
import { useState, useRef, useEffect } from 'react';

import { TIMEZONE } from '@/util/formatters';
import { createLineItem } from '@/util/queries';
import { RATE_TYPES } from '@/util/types';

import DrawerWrapper from '../DrawerWrapper';
import AddVerticalProductForm from './AddVerticalProductForm';
import LineItemForm from './LineItemForm';

type CreateLineItemFormProps = {
	orderId: string;
	products: { id: string; name: string }[];
};

type DrawerView = 'lineItem' | 'addProduct';

export default function CreateLineItemForm({ orderId, products }: CreateLineItemFormProps) {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [drawerView, setDrawerView] = useState<DrawerView>('lineItem');
	const [localProducts, setLocalProducts] = useState<{ id: string; name: string }[]>([]);

	const [productId, setProductId] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [rateType, setRateType] = useState<string>('');
	const [rate, setRate] = useState<string>('');
	const [quantity, setQuantity] = useState('');

	const seededOnceRef = useRef(false);

	const allProducts = [...products, ...localProducts];

	useEffect(() => {
		if (!isOpen) {
			seededOnceRef.current = false;
			setDrawerView('lineItem');
			setLocalProducts([]);
			return;
		}
		if (seededOnceRef.current) return;
		if (!products?.length) return;
		seededOnceRef.current = true;

		const prod = faker.helpers.arrayElement(products);
		const start = faker.date.soon({ days: 30 });
		const maybeHasEnd = faker.datatype.boolean();
		const end = maybeHasEnd
			? faker.date.soon({ days: faker.number.int({ min: 3, max: 90 }), refDate: start })
			: null;

		setProductId(prod.id);
		setName(faker.commerce.productName());
		setStartDate(DateTime.fromJSDate(start, { zone: TIMEZONE }).toISODate() ?? '');
		setEndDate(end ? (DateTime.fromJSDate(end, { zone: TIMEZONE }).toISODate() ?? '') : '');
		setRateType(faker.helpers.arrayElement(RATE_TYPES as readonly string[]));
		setRate(String(faker.number.float({ min: 5, max: 100, multipleOf: 0.01 }).toFixed(2)));
		setQuantity(String(faker.number.int({ min: 1, max: 3 })));
	}, [isOpen, products.length ?? 0]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleClose = () => {
		setIsOpen(false);
		setDrawerView('lineItem');
	};

	const handleProductSelected = ({
		productId: newProductId,
		rateType: newRateType,
		rate: newRate,
	}: {
		productId: string;
		rateType: string;
		rate: string;
	}) => {
		if (newProductId) setProductId(newProductId);
		if (newRateType) setRateType(newRateType);
		if (newRate) setRate(newRate);
		setDrawerView('lineItem');
	};

	const drawerTitle = drawerView === 'addProduct' ? 'Add vertical product' : 'Add line item';
	const drawerDescription =
		drawerView === 'addProduct'
			? 'Choose how to add a new vertical product to your order.'
			: 'Add a line item below and click create when done.';

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='primary-btn flex items-center justify-between gap-x-2'
			>
				Add a line item
				<PlusIcon width={15} height={15} />
			</button>
			<DrawerWrapper
				isOpen={isOpen}
				onClose={handleClose}
				title={drawerTitle}
				description={drawerDescription}
			>
				{drawerView === 'addProduct' ? (
					<AddVerticalProductForm
						products={allProducts}
						onComplete={handleProductSelected}
						onProductCreated={(product) =>
							setLocalProducts((prev) => [...prev, product])
						}
						onBack={() => setDrawerView('lineItem')}
					/>
				) : (
					<LineItemForm
						initialValues={{ productId, name, startDate, endDate, rateType, rate, quantity }}
						products={allProducts}
						submitFn={createLineItem}
						extraData={{ orderId }}
						closeDrawer={handleClose}
						resetOnSubmit
						submitLabel='Create'
						onAddProduct={() => setDrawerView('addProduct')}
					/>
				)}
			</DrawerWrapper>
		</>
	);
}
