'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { formatLabel } from '@/util/formatters';
import { createProduct } from '@/util/queries';

type AddVerticalProductFormProps = {
	onComplete: (product: { id: string; name: string }) => void;
	onBack: () => void;
};

export default function AddVerticalProductForm({ onComplete, onBack }: AddVerticalProductFormProps) {
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError('Product name is required');
			return;
		}
		setIsSubmitting(true);
		try {
			const product = await createProduct({ name: name.trim() });
			onComplete(product);
		} catch {
			setError('Failed to create product. A product with this name may already exist.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='flex flex-col gap-4'>
				<button
					type='button'
					onClick={onBack}
					className='flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
				>
					<ArrowLeftIcon className='h-3 w-3' />
					Back
				</button>
				<div>
					{formatLabel('Product Name', { required: true })}
					{/* eslint-disable-next-line jsx-a11y/no-autofocus */}
					<input
						autoFocus
						type='text'
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							setError('');
						}}
						placeholder='e.g. Newsletter'
						className='input'
					/>
					{error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
				</div>
				<div className='pt-2 text-end'>
					<button type='submit' disabled={isSubmitting} className='primary-btn'>
						{isSubmitting ? 'Creating...' : 'Create product'}
					</button>
				</div>
			</div>
		</form>
	);
}
