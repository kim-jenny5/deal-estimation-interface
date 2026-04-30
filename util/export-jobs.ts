'use server';

import { waitUntil } from '@vercel/functions';

import { prisma } from '@/prisma/client';

import { processExportJob } from './process-export-job';

export type ExportJobSummary = {
	id: string;
	name: string;
	status: string;
	createdAt: string;
};

export async function createExportJob(orderId: string, orderName: string): Promise<{ jobId: string }> {
	const baseName = orderName
		.replaceAll(/[^\w]+/g, '-')
		.replaceAll(/^-|-$/g, '')
		.slice(0, 60) || 'Order';
	const name = `TGE Demo ${baseName}.xlsx`;

	const job = await prisma.exportJob.create({
		data: { name, status: 'pending' },
	});

	waitUntil(processExportJob(job.id, orderId));

	return { jobId: job.id };
}

export async function getExportJobs(): Promise<ExportJobSummary[]> {
	const jobs = await prisma.exportJob.findMany({
		orderBy: { createdAt: 'desc' },
		take: 10,
		select: { id: true, name: true, status: true, createdAt: true },
	});

	return jobs.map((job) => ({
		...job,
		createdAt: job.createdAt.toISOString(),
	}));
}
