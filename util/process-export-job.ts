import { prisma } from '@/prisma/client';

import { generateOrderExcel } from './excel-generator';

export async function processExportJob(jobId: string, orderId: string): Promise<void> {
	const delayMs = Math.random() * 30 * 1000;
	await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: { lineItems: { include: { product: true } } },
	});

	if (!order) return;

	const fileData = await generateOrderExcel(
		order.name,
		order.lineItems.map((li) => ({
			name: li.name,
			product: li.product,
			startDate: li.startDate,
			endDate: li.endDate,
			rateType: li.rateType,
			rate: li.rate,
			quantity: li.quantity,
			subtotal: li.subtotal,
		})),
		Number(order.totalBudget)
	);

	const completeJobs = await prisma.exportJob.findMany({
		where: { status: 'complete' },
		orderBy: { createdAt: 'asc' },
		select: { id: true },
	});

	if (completeJobs.length >= 10) {
		const excess = completeJobs.slice(0, -9);
		await prisma.exportJob.deleteMany({
			where: { id: { in: excess.map((j) => j.id) } },
		});
	}

	await prisma.exportJob.update({
		where: { id: jobId },
		data: { status: 'complete', fileData },
	});
}
