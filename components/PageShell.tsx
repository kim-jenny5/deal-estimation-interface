'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createExportJob, getExportJobs } from '@/util/export-jobs';

import DashboardView from './DashboardView';
import DownloadedTab from './DownloadedTab';
import Header from './Header';
import ExportBanner from './ui/ExportBanner';

import type { ExportJobSummary } from '@/util/export-jobs';
import type { SerializedOrder } from '@/util/types';

type Tab = 'overview' | 'downloaded';

export default function PageShell({ order }: { order: SerializedOrder }) {
	const [activeTab, setActiveTab] = useState<Tab>('overview');
	const [bannerIds, setBannerIds] = useState<number[]>([]);
	const bannerCounter = useRef(0);
	const [jobs, setJobs] = useState<ExportJobSummary[]>([]);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const { totalBudget, totalSpend, productsCount, lineItemsCount, lineItems } = order;

	const fetchJobs = useCallback(async () => {
		const updated = await getExportJobs();
		setJobs(updated);
		if (updated.every((j) => j.status === 'complete') && pollingRef.current) {
			clearInterval(pollingRef.current);
			pollingRef.current = null;
		}
	}, []);

	const startPolling = useCallback(() => {
		if (pollingRef.current) return;
		pollingRef.current = setInterval(fetchJobs, 5000);
	}, [fetchJobs]);

	useEffect(() => {
		fetchJobs();
	}, [fetchJobs]);

	const handleExport = async () => {
		const id = ++bannerCounter.current;
		setBannerIds((prev) => [...prev, id]);
		try {
			await createExportJob(order.id, order.name);
			await fetchJobs();
			startPolling();
		} catch (error) {
			console.error('Export failed:', error);
		}
	};

	const hasPendingJobs = jobs.some((j) => j.status !== 'complete');

	useEffect(() => {
		if (hasPendingJobs) startPolling();
	}, [hasPendingJobs, startPolling]);

	useEffect(() => {
		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current);
		};
	}, []);

	const completedCount = jobs.filter((j) => j.status === 'complete').length;
	const pendingCount = jobs.filter((j) => j.status !== 'complete').length;

	return (
		<main className='wrapper min-h-screen flex-col gap-y-6'>
			<div className='flex border-b border-neutral-200'>
				<button
					onClick={() => setActiveTab('overview')}
					className={`cursor-pointer px-1 pb-2.5 text-sm font-medium transition-colors ${
						activeTab === 'overview'
							? 'border-b-2 border-neutral-800 text-neutral-800'
							: 'text-neutral-400 hover:text-neutral-600'
					}`}
				>
					Overview
				</button>
				<button
					onClick={() => setActiveTab('downloaded')}
					className={`ml-6 cursor-pointer px-1 pb-2.5 text-sm font-medium transition-colors ${
						activeTab === 'downloaded'
							? 'border-b-2 border-neutral-800 text-neutral-800'
							: 'text-neutral-400 hover:text-neutral-600'
					}`}
				>
					Downloaded
					{(completedCount > 0 || pendingCount > 0) && (
						<span
							className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
								pendingCount > 0 ? 'bg-neutral-200 text-neutral-600' : 'bg-neutral-800 text-white'
							}`}
						>
							{completedCount + pendingCount}
						</span>
					)}
				</button>
			</div>

			{activeTab === 'overview' ? (
				<>
					<Header order={order} onExport={handleExport} />
					<DashboardView
						orderId={order.id}
						totalBudget={totalBudget}
						totalSpend={totalSpend}
						productsCount={productsCount}
						lineItemsCount={lineItemsCount}
						lineItems={lineItems}
					/>
				</>
			) : (
				<DownloadedTab jobs={jobs} />
			)}

			<div className='fixed right-12 bottom-6 z-50 flex flex-col-reverse gap-y-2'>
				{bannerIds.map((id) => (
					<ExportBanner
						key={id}
						onDismiss={() => setBannerIds((prev) => prev.filter((b) => b !== id))}
					/>
				))}
			</div>
		</main>
	);
}
