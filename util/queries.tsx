'use server';

import { Prisma, PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/prisma/client';
import { repopulate } from '@/prisma/repopulate';

import { convertToUTC } from './formatters';
import { CurrentUser, SerializedOrder } from './types';

export async function resetDatabase() {
	await prisma.$transaction(async (tx) => {
		await tx.exportJob.deleteMany({});
		await tx.lineItem.deleteMany({});
		await tx.product.deleteMany({});
		await tx.order.deleteMany({});
		await tx.user.deleteMany({});
	});

	await repopulate();

	revalidatePath('/');
}

// no real auth is to be implemented in this project
// this function just returns the first user in the DB as the "current" user
export async function getCurrentUser() {
	const user = await prisma.user.findFirst();

	if (!user) {
		const err = new Error('No user found');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(err as any).code = 'NO_USER_FOUND';
		throw err;
	}

	return user;
}

export async function getOrderByIdOrFirst(user: CurrentUser, orderId?: string) {
	const userWithOrders = await prisma.user.findUnique({
		where: { id: user.id },
		include: {
			orders: {
				orderBy: { createdAt: 'desc' },
				include: { lineItems: { include: { product: true } } },
			},
		},
	});

	if (!userWithOrders) {
		const err = new Error('No user found');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(err as any).code = 'NO_USER_FOUND';
		throw err;
	}

	const selectedOrder = orderId
		? userWithOrders.orders.find((o) => o.id === orderId)
		: userWithOrders.orders[0];

	if (!selectedOrder) {
		const err = new Error('No orders found for current user');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(err as any).code = 'NO_ORDERS_FOUND';
		throw err;
	}

	const serializedOrder: SerializedOrder = {
		...selectedOrder,
		status: selectedOrder.status,
		totalBudget: selectedOrder.totalBudget.toNumber(),
		totalSpend: selectedOrder.totalSpend.toNumber(),
		deliverableDueAt: selectedOrder.deliverableDueAt.toISOString(),
		createdAt: selectedOrder.createdAt.toISOString(),
		updatedAt: selectedOrder.updatedAt.toISOString(),
		lineItems: selectedOrder.lineItems.map((item) => ({
			...item,
			rate: item.rate.toNumber(),
			subtotal: item.subtotal.toNumber(),
			startDate: item.startDate.toISOString(),
			endDate: item.endDate?.toISOString() ?? '',
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
			product: {
				...item.product,
				createdAt: item.product.createdAt.toISOString(),
				updatedAt: item.product.updatedAt.toISOString(),
			},
		})),
	};

	return serializedOrder;
}

export async function updateOrder(data: {
	id: string;
	name: string;
	status: string;
	deliverableDueAt: string;
	totalBudget: number;
}) {
	const { id, name, status, deliverableDueAt, totalBudget } = data;

	await prisma.order.update({
		where: { id },
		data: {
			name,
			status,
			totalBudget,
			deliverableDueAt: convertToUTC(deliverableDueAt),
		},
	});

	revalidatePath('/');
}

export async function getAllProducts() {
	return await prisma.product.findMany({
		select: {
			id: true,
			name: true,
		},
	});
}

export async function createProduct(data: { name: string }) {
	const product = await prisma.product.upsert({
		where: { name: data.name },
		update: {},
		create: { name: data.name },
		select: { id: true, name: true },
	});
	revalidatePath('/');
	return product;
}

async function recalculateOrder(
	orderId: string,
	db: PrismaClient | Prisma.TransactionClient = prisma
) {
	const lineItems = await db.lineItem.findMany({
		where: { orderId },
		select: { productId: true, subtotal: true },
	});

	const totalSpend = lineItems.reduce((sum, li) => sum + li.subtotal.toNumber(), 0);
	const productsCount = new Set(lineItems.map((li) => li.productId)).size;
	const lineItemsCount = lineItems.length;

	await db.order.update({
		where: { id: orderId },
		data: { totalSpend, productsCount, lineItemsCount },
	});
}

export async function createLineItem(data: {
	orderId: string;
	productId: string;
	name: string;
	startDate: string;
	endDate?: string;
	rateType: string;
	rate: number;
	quantity: number;
}) {
	const { orderId, productId, name, startDate, endDate, rateType, rate, quantity } = data;

	const subtotal = rate * quantity;

	await prisma.$transaction(async (tx) => {
		await tx.lineItem.create({
			data: {
				orderId,
				productId,
				name,
				startDate: convertToUTC(startDate),
				endDate: endDate ? convertToUTC(endDate) : null,
				rateType,
				rate,
				quantity,
				subtotal,
			},
		});

		await recalculateOrder(orderId, tx);
	});

	revalidatePath('/');
}

export async function updateLineItem(params: {
	id: string;
	productId: string;
	name: string;
	startDate: string;
	endDate?: string;
	rateType: string;
	rate: number;
	quantity: number;
}) {
	const { id, productId, name, startDate, endDate, rateType, rate, quantity } = params;
	const subtotal = rate * quantity;

	await prisma.$transaction(async (tx) => {
		const existing = await tx.lineItem.findUnique({
			where: { id },
			select: { orderId: true },
		});
		if (!existing?.orderId) throw new Error('Order not found for line item');

		await tx.lineItem.update({
			where: { id },
			data: {
				productId,
				name,
				startDate: convertToUTC(startDate),
				endDate: endDate ? convertToUTC(endDate) : null,
				rateType,
				rate,
				quantity,
				subtotal,
			},
		});

		await recalculateOrder(existing.orderId, tx);
	});

	revalidatePath('/');
}

export async function deleteLineItem(formData: FormData) {
	const id = formData.get('id') as string;
	if (!id) throw new Error('Missing/invalid line item');

	await prisma.$transaction(async (tx) => {
		const li = await tx.lineItem.findUnique({
			where: { id },
			select: { orderId: true },
		});
		if (!li?.orderId) throw new Error('Order not found');

		await tx.lineItem.delete({ where: { id } });
		await recalculateOrder(li.orderId, tx);
	});

	revalidatePath('/');
}
