'use client';

import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { createProduct } from '@/util/queries';
import { RATE_TYPES } from '@/util/types';

const RATE_CARDS = [
	{ id: 'standard-cpm', name: 'Standard CPM', rateType: 'CPM', rate: '10.00' },
	{ id: 'premium-cpm', name: 'Premium CPM', rateType: 'CPM', rate: '25.00' },
	{ id: 'flat', name: 'Flat Rate', rateType: 'Flat', rate: '' },
	{ id: 'cpc', name: 'Cost Per Click', rateType: 'CPC', rate: '' },
	{ id: 'cpa', name: 'Cost Per Acquisition', rateType: 'CPA', rate: '' },
	{ id: 'custom', name: 'Custom', rateType: '', rate: '' },
] as const;

type RateCard = (typeof RATE_CARDS)[number];

type Step = 'choosePath' | 'newRate_rateCard' | 'newRate_product' | 'existing_rateType';

type AddVerticalProductFormProps = {
	products: { id: string; name: string }[];
	onComplete: (selection: { productId: string; rateType: string; rate: string }) => void;
	onProductCreated: (product: { id: string; name: string }) => void;
	onBack: () => void;
};

export default function AddVerticalProductForm({
	products,
	onComplete,
	onProductCreated,
	onBack,
}: AddVerticalProductFormProps) {
	const [step, setStep] = useState<Step>('choosePath');
	const [selectedRateCard, setSelectedRateCard] = useState<RateCard | null>(null);
	const [selectedProductId, setSelectedProductId] = useState('');
	const [newProductName, setNewProductName] = useState('');
	const [isNewProduct, setIsNewProduct] = useState(false);
	const [selectedRateType, setSelectedRateType] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNewRateProductContinue = async () => {
		setError('');
		if (isNewProduct) {
			if (!newProductName.trim()) {
				setError('Product name is required');
				return;
			}
			setIsSubmitting(true);
			try {
				const product = await createProduct({ name: newProductName.trim() });
				onProductCreated(product);
				onComplete({
					productId: product.id,
					rateType: selectedRateCard?.rateType ?? '',
					rate: selectedRateCard?.rate ?? '',
				});
			} catch {
				setError('Failed to create product. It may already exist.');
			} finally {
				setIsSubmitting(false);
			}
		} else {
			if (!selectedProductId) {
				setError('Please select a product');
				return;
			}
			onComplete({
				productId: selectedProductId,
				rateType: selectedRateCard?.rateType ?? '',
				rate: selectedRateCard?.rate ?? '',
			});
		}
	};

	const handleExistingRateTypeContinue = () => {
		setError('');
		if (!selectedRateType) {
			setError('Please select a rate type');
			return;
		}
		onComplete({ productId: '', rateType: selectedRateType, rate: '' });
	};

	if (step === 'choosePath') {
		return (
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					onClick={onBack}
					className='flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
				>
					<ArrowLeftIcon className='h-3 w-3' />
					Back to line item
				</button>
				<p className='text-sm text-gray-600'>How would you like to add this product?</p>
				<div className='flex flex-col gap-3'>
					<button
						type='button'
						onClick={() => setStep('newRate_rateCard')}
						className='rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50'
					>
						<div className='text-sm font-medium'>Create a new Order Product Rate</div>
						<div className='mt-1 text-xs text-gray-500'>
							Select a rate card and product, then configure the rate details
						</div>
					</button>
					<button
						type='button'
						onClick={() => setStep('existing_rateType')}
						className='rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50'
					>
						<div className='text-sm font-medium'>Select an existing Order Product Rate</div>
						<div className='mt-1 text-xs text-gray-500'>
							Choose from existing rate types and configure the vertical product
						</div>
					</button>
				</div>
			</div>
		);
	}

	if (step === 'newRate_rateCard') {
		return (
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					onClick={() => { setError(''); setStep('choosePath'); }}
					className='flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
				>
					<ArrowLeftIcon className='h-3 w-3' />
					Back
				</button>
				<div>
					<p className='mb-2 text-sm font-medium text-gray-900'>Select a Rate Card</p>
					<div className='flex flex-col gap-2'>
						{RATE_CARDS.map((card) => (
							<button
								key={card.id}
								type='button'
								onClick={() => setSelectedRateCard(card)}
								className={`rounded-lg border p-3 text-left text-sm transition-colors ${
									selectedRateCard?.id === card.id
										? 'border-neutral-800 bg-neutral-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className='font-medium'>{card.name}</div>
								{card.rateType && (
									<div className='mt-0.5 text-xs text-gray-500'>
										{card.rateType}
										{card.rate ? ` · $${card.rate}` : ''}
									</div>
								)}
							</button>
						))}
					</div>
				</div>
				{error && <p className='text-sm text-red-500'>{error}</p>}
				<div className='pt-2 text-end'>
					<button
						type='button'
						onClick={() => {
							if (!selectedRateCard) {
								setError('Please select a rate card');
								return;
							}
							setError('');
							setStep('newRate_product');
						}}
						className='primary-btn'
					>
						Next
					</button>
				</div>
			</div>
		);
	}

	if (step === 'newRate_product') {
		return (
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					onClick={() => { setError(''); setStep('newRate_rateCard'); }}
					className='flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
				>
					<ArrowLeftIcon className='h-3 w-3' />
					Back
				</button>
				<div>
					<p className='mb-2 text-sm font-medium text-gray-900'>Select a Product</p>
					<div className='flex flex-col gap-2'>
						<button
							type='button'
							onClick={() => {
								setIsNewProduct(true);
								setSelectedProductId('');
							}}
							className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
								isNewProduct
									? 'border-neutral-800 bg-neutral-50'
									: 'border-dashed border-gray-300 hover:border-gray-400'
							}`}
						>
							<PlusIcon className='h-4 w-4 text-gray-500' />
							<span>Create new product</span>
						</button>
						{isNewProduct && (
							<input
								// eslint-disable-next-line jsx-a11y/no-autofocus
								autoFocus
								type='text'
								value={newProductName}
								onChange={(e) => setNewProductName(e.target.value)}
								placeholder='Product name'
								className='input'
							/>
						)}
						{products.map((product) => (
							<button
								key={product.id}
								type='button'
								onClick={() => {
									setSelectedProductId(product.id);
									setIsNewProduct(false);
								}}
								className={`rounded-lg border p-3 text-left text-sm transition-colors ${
									selectedProductId === product.id
										? 'border-neutral-800 bg-neutral-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								{product.name}
							</button>
						))}
					</div>
				</div>
				{error && <p className='text-sm text-red-500'>{error}</p>}
				<div className='pt-2 text-end'>
					<button
						type='button'
						onClick={handleNewRateProductContinue}
						disabled={isSubmitting}
						className='primary-btn'
					>
						{isSubmitting ? 'Creating...' : 'Continue'}
					</button>
				</div>
			</div>
		);
	}

	if (step === 'existing_rateType') {
		return (
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					onClick={() => { setError(''); setStep('choosePath'); }}
					className='flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
				>
					<ArrowLeftIcon className='h-3 w-3' />
					Back
				</button>
				<div>
					<p className='mb-2 text-sm font-medium text-gray-900'>Select an existing Order Rate Type</p>
					<div className='flex flex-col gap-2'>
						{RATE_TYPES.map((rateType) => (
							<button
								key={rateType}
								type='button'
								onClick={() => setSelectedRateType(rateType)}
								className={`rounded-lg border p-3 text-left text-sm transition-colors ${
									selectedRateType === rateType
										? 'border-neutral-800 bg-neutral-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								{rateType}
							</button>
						))}
					</div>
				</div>
				{error && <p className='text-sm text-red-500'>{error}</p>}
				<div className='pt-2 text-end'>
					<button
						type='button'
						onClick={handleExistingRateTypeContinue}
						className='primary-btn'
					>
						Continue
					</button>
				</div>
			</div>
		);
	}

	return null;
}
