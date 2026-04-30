'use client';

export default function ExportButton({ onExport }: { onExport?: () => void }) {
	return (
		<div className='flex gap-2'>
			<button className='secondary-btn' onClick={onExport}>
				Export
			</button>
		</div>
	);
}
