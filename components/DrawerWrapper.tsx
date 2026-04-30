'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { ReactNode, useEffect } from 'react';

type DrawerWrapperProps = {
	children: ReactNode;
	title: string;
	description: string;
	isOpen: boolean;
	onClose: () => void;
};

export default function DrawerWrapper({
	children,
	title,
	description,
	isOpen,
	onClose,
}: DrawerWrapperProps) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		globalThis.addEventListener('keydown', handleEsc);
		return () => globalThis.removeEventListener('keydown', handleEsc);
	}, [onClose]);

	return (
		<>
			{isOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-400'
					onClick={onClose}
				/>
			)}
			<div
				className={`fixed top-0 right-0 z-50 h-full w-3/4 transform bg-white transition-transform duration-500 ease-in-out sm:w-1/3 sm:max-w-md ${isOpen ? 'translate-x-0 shadow-xl' : 'translate-x-full'}`}
			>
				<div className='flex flex-col gap-y-1 p-4'>
					<div className='flex justify-between'>
						<h2 className='col-start-1 row-start-1 text-2xl capitalize'>{title}</h2>
						<button
							onClick={onClose}
							className='col-start-2 row-start-1 w-fit cursor-pointer place-self-end rounded-full p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300'
						>
							<XMarkIcon width={20} height={20} />
						</button>
					</div>
					<p className='text-sm text-neutral-600'>{description}</p>
				</div>
				<div className='p-4'>{children}</div>
			</div>
		</>
	);
}
