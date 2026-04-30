import { useState, useEffect } from 'react';

import { PlusIcon } from '@heroicons/react/24/solid';

import { formatLabel } from '@/util/formatters';
import { lineItemFormSchema } from '@/util/schemas';
import { RATE_TYPES } from '@/util/types';

import SelectInput from '../ui/SelectInput';
import TextInputCurrency from '../ui/TextInputCurrency';

type LineItemFormProps = {
	initialValues: {
		productId: string;
		name: string;
		startDate: string;
		endDate: string;
		rateType: string;
		rate: string;
		quantity: string;
	};
	products: { id: string; name: string }[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	submitFn: (data: any) => Promise<any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extraData?: Record<string, any>;
	closeDrawer: () => void;
	resetOnSubmit?: boolean;
	resetKey?: boolean;
	submitLabel: string;
	onAddProduct?: () => void;
};

export default function LineItemForm({
	initialValues,
	products,
	submitFn,
	extraData = {},
	closeDrawer,
	resetOnSubmit = false,
	resetKey,
	submitLabel,
	onAddProduct,
}: LineItemFormProps) {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const set =
		<K extends keyof typeof initialValues>(k: K) =>
		(v: (typeof initialValues)[K]) =>
			setValues((prev) => ({ ...prev, [k]: v }));

	useEffect(() => {
		setValues(initialValues);
		setErrors({});
	}, [resetKey, initialValues]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = lineItemFormSchema.safeParse(values);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const key = issue.path[0] as string;
				if (key) fieldErrors[key] = issue.message;
			}
			setErrors(fieldErrors);
			return;
		}
		setErrors({});

		try {
			await submitFn({
				...extraData,
				productId: values.productId,
				name: values.name,
				startDate: values.startDate,
				endDate: values.endDate,
				rateType: values.rateType,
				rate: Number.parseFloat(values.rate),
				quantity: Number.parseInt(values.quantity, 10),
			});

			if (resetOnSubmit) {
				setValues({
					productId: '',
					name: '',
					startDate: '',
					endDate: '',
					rateType: '',
					rate: '',
					quantity: '',
				});
			}

			closeDrawer();
		} catch (error) {
			throw new Error(`Failed to submit line item: ${error}`);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='border-b border-gray-900/10 pb-6'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<div className='sm:col-span-full'>
						<SelectInput
							key={`${values.productId}-${products.length}`}
							name='product'
							value={products.find((product) => product.id === values.productId)?.name ?? ''}
							options={products.map((product) => product.name)}
							onChange={(name) => {
								const matched = products.find((product) => product.name === name);
								set('productId')(matched?.id ?? '');
							}}
							labelAction={
								onAddProduct ? (
									<button
										type='button'
										onClick={onAddProduct}
										className='flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300'
									>
										<PlusIcon className='h-3 w-3' />
										Add new
									</button>
								) : undefined
							}
						/>
					</div>
					<div className='sm:col-span-full'>
						{formatLabel('Name', { required: true })}
						<input
							type='text'
							id='name'
							value={values.name}
							onChange={(e) => set('name')(e.target.value)}
							className='input'
						/>
						{errors.name && <p className='mt-1 text-sm text-red-500'>{errors.name}</p>}
					</div>
					<div className='sm:col-span-1'>
						{formatLabel('Start Date', { required: true })}
						<input
							type='date'
							id='startDate'
							value={values.startDate}
							onChange={(e) => set('startDate')(e.target.value)}
							className='input'
						/>
						{errors.startDate && <p className='mt-1 text-sm text-red-500'>{errors.startDate}</p>}
					</div>
					<div className='sm:col-span-1'>
						{formatLabel('End Date')}
						<input
							type='date'
							id='endDate'
							value={values.endDate}
							onChange={(e) => set('endDate')(e.target.value)}
							className='input'
						/>
						{errors.endDate && <p className='mt-1 text-sm text-red-500'>{errors.endDate}</p>}
					</div>
					<div className='sm:col-span-1'>
						<SelectInput
							name='rateType'
							value={values.rateType}
							onChange={(value) => set('rateType')(value)}
							options={RATE_TYPES}
						/>
					</div>
					<div className='sm:col-span-1'>
						<TextInputCurrency
							name='rate'
							value={values.rate}
							onChange={(e) => set('rate')(e.target.value)}
						/>
						{errors.rate && <p className='mt-1 text-sm text-red-500'>{errors.rate}</p>}
					</div>
					<div className='sm:col-span-full'>
						{formatLabel('Quantity', { required: true })}
						<input
							type='number'
							id='quantity'
							value={values.quantity}
							onChange={(e) => set('quantity')(e.target.value)}
							className='input'
						/>
						{errors.quantity && <p className='mt-1 text-sm text-red-500'>{errors.quantity}</p>}
					</div>
				</div>
			</div>
			<div className='pt-6 text-end'>
				<button type='submit' className='primary-btn'>
					{submitLabel}
				</button>
			</div>
		</form>
	);
}
