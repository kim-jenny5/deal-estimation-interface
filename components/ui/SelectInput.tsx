'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { formatLabel, formatPlaceholder } from '@/util/formatters';

type SelectInputProps = {
	name: string;
	value?: string;
	defaultValue?: string;
	options: readonly string[];
	placeholder?: string;
	required?: boolean;
	onChange?: (value: string) => void;
	labelAction?: ReactNode;
};

const statusStyles: Record<string, string> = {
	Pending: 'bg-gray-500',
	'In progress': 'bg-yellow-500',
	Completed: 'bg-green-500',
	Lost: 'bg-red-500',
};

export default function SelectInput({
	name,
	value,
	defaultValue = '',
	options,
	placeholder,
	required = true,
	onChange,
	labelAction,
}: SelectInputProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [selected, setSelected] = useState<string>(value ?? defaultValue ?? '');
	const [query, setQuery] = useState<string>(selected);
	const [open, setOpen] = useState(false);

	const showDot = name === 'status';

	useEffect(() => {
		if (value !== undefined) {
			setSelected(value);
			setQuery(value);
		}
	}, [value]);

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (!rootRef.current) return;
			if (!rootRef.current.contains(e.target as Node)) {
				setOpen(false);
				setTimeout(() => {
					const isValid = options.some(
						(opt) => opt.toLowerCase() === (query ?? '').trim().toLowerCase()
					);
					if (!open && !isValid) setQuery(selected);
				}, 0);
			}
		};

		document.addEventListener('mousedown', onDocClick);

		return () => document.removeEventListener('mousedown', onDocClick);
	}, [options, query, selected, open]);

	const filtered = useMemo(() => {
		if (showDot) return options;

		const q = (query ?? '').trim().toLowerCase();

		if (!q || q === (selected ?? '').toLowerCase()) return options;
		return options.filter((opt) => opt.toLowerCase().includes(q));
	}, [options, query, selected, showDot]);

	return (
		<>
			{labelAction ? (
				<div className='flex items-center justify-between'>
					{formatLabel(name, { required })}
					{labelAction}
				</div>
			) : (
				formatLabel(name, { required })
			)}
			<div ref={rootRef} className='relative w-full'>
				<input type='hidden' name={name} value={selected ?? ''} required={required} />
				{showDot ? (
					<button type='button' className='input' onClick={() => setOpen((prev) => !prev)}>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								{selected ? (
									<>
										<span className={`h-2 w-2 rounded-full ${statusStyles[selected] || ''}`} />
										<span>{selected}</span>
									</>
								) : (
									<span className='text-gray-400 italic'>Select {formatPlaceholder(name)}</span>
								)}
							</div>
							<ChevronDownIcon
								className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
									open ? 'rotate-180' : ''
								}`}
							/>
						</div>
					</button>
				) : (
					<div className='relative'>
						<input
							ref={inputRef}
							type='text'
							value={query}
							onFocus={() => setOpen(true)}
							onClick={() => setOpen(true)}
							onChange={(e) => {
								setQuery(e.target.value);
								setOpen(true);
							}}
							onBlur={(e) => {
								const next = e.relatedTarget as HTMLElement | null;
								if (next && rootRef.current?.contains(next)) return;
								const isValid = options.some(
									(opt) => opt.toLowerCase() === (query ?? '').trim().toLowerCase()
								);
								if (!isValid) setQuery(selected);
								setOpen(false);
							}}
							placeholder={placeholder ?? `Select ${formatPlaceholder(name)}`}
							className='input pr-8'
						/>
						<ChevronDownIcon
							className={`pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
						/>
					</div>
				)}
				{open && (
					<ul
						id={`${name}-listbox`}
						role='listbox'
						className='absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black/5'
					>
						{filtered.map((option) => (
							<li key={option} role='presentation' className='px-1 py-0.5'>
								<button
									className='flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
									onClick={() => {
										if (option !== selected) {
											setSelected(option);
											onChange?.(option);
											setQuery(option);
										}
										setOpen(false);
									}}
								>
									{showDot && (
										<span className={`h-2 w-2 rounded-full ${statusStyles[option] || ''}`} />
									)}
									{option}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
