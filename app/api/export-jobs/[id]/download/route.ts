import { NextResponse } from 'next/server';

import { prisma } from '@/prisma/client';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const job = await prisma.exportJob.findUnique({
		where: { id },
		select: { name: true, fileData: true, status: true },
	});

	if (!job || !job.fileData || job.status !== 'complete') {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	const buf = job.fileData;
	const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

	return new NextResponse(arrayBuffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${job.name}"`,
		},
	});
}
