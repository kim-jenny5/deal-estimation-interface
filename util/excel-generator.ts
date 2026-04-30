import ExcelJS from 'exceljs';
import { DateTime } from 'luxon';

import { TIMEZONE } from './formatters';

type LineItemInput = {
	name: string;
	product: { name: string };
	startDate: string | Date | null;
	endDate: string | Date | null;
	rateType: string;
	rate: number | string | { toNumber(): number };
	quantity: number | string;
	subtotal: number | string | { toNumber(): number };
};

const toN = (v: number | string | null | undefined | { toNumber(): number }): number => {
	if (v === null || v === undefined) return 0;
	if (typeof v === 'object' && 'toNumber' in v) return v.toNumber();
	return typeof v === 'number' ? v : Number(v);
};

const toYMD = (d: string | Date | null, tz: string = TIMEZONE): string => {
	if (!d) return '';
	let dt: DateTime;
	if (typeof d === 'string') {
		dt = /^\d{4}-\d{2}-\d{2}$/.test(d)
			? DateTime.fromISO(d, { zone: tz })
			: DateTime.fromISO(d, { setZone: true }).setZone(tz);
	} else {
		dt = DateTime.fromJSDate(d, { zone: 'utc' }).setZone(tz);
	}
	return dt.isValid ? dt.toFormat('yyyy-LL-dd') : '';
};

export async function generateOrderExcel(
	orderName: string,
	lineItems: LineItemInput[],
	totalBudget: number
): Promise<Buffer> {
	const groups: Record<string, LineItemInput[]> = {};
	for (const li of lineItems) {
		const key = li.product?.name?.trim() || 'Uncategorized';
		(groups[key] ??= []).push(li);
	}
	const entries = Object.entries(groups)
		.sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
		.map(([product, items]) => [
			product,
			[...items].sort((a, b) => (toYMD(a.startDate) > toYMD(b.startDate) ? 1 : -1)),
		]) as [string, LineItemInput[]][];

	const totalSpend = lineItems.reduce((s, li) => s + toN(li.subtotal), 0);
	const pct = totalBudget > 0 ? totalSpend / totalBudget : 0;

	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet('Order');

	ws.columns = [
		{ header: 'DESCRIPTION', key: 'desc', width: 32 },
		{ header: 'PRODUCT', key: 'prod', width: 20 },
		{ header: 'START DATE', key: 'start', width: 12 },
		{ header: 'END DATE', key: 'end', width: 12 },
		{ header: 'RATE TYPE', key: 'rtype', width: 12 },
		{ header: 'RATE', key: 'rate', width: 12 },
		{ header: 'QUANTITY', key: 'qty', width: 10 },
		{ header: 'SUBTOTAL', key: 'sub', width: 14 },
	];

	const setRowBottomBorder = (rowIdx: number, style: 'thin' | 'medium' | 'thick') => {
		for (let c = 1; c <= 8; c++) {
			const cell = ws.getCell(rowIdx, c);
			cell.border = { ...cell.border, bottom: { style } };
		}
	};

	const moneyFmt = '$#,##0.00';
	const numFmt = '#,##0.00';
	const pctFmt = '0.00%';
	const lightGray = 'FFEFEFEF';
	const center = { vertical: 'middle', horizontal: 'center' } as const;

	ws.mergeCells(1, 1, 1, 8);
	const title = ws.getCell(1, 1);
	title.value = orderName;
	title.alignment = center;
	title.font = { bold: true, size: 14 };

	ws.getCell('A2').value = 'Total Budget';
	ws.getCell('B2').value = totalBudget;
	ws.getCell('B2').numFmt = moneyFmt;

	ws.getCell('A3').value = 'Total Spend';
	ws.getCell('B3').value = totalSpend;
	ws.getCell('B3').numFmt = moneyFmt;
	ws.getCell('C3').value = pct;
	ws.getCell('C3').numFmt = pctFmt;

	setRowBottomBorder(3, 'thick');

	let r = 4;
	ws.getRow(r).height = 6;
	r++;

	const headerRowIdx = r;
	const headerRow = ws.getRow(headerRowIdx);
	headerRow.values = ['DESCRIPTION', 'PRODUCT', 'START DATE', 'END DATE', 'RATE TYPE', 'RATE', 'QUANTITY', 'SUBTOTAL'];
	headerRow.font = { bold: true };
	headerRow.alignment = center;
	headerRow.eachCell((cell) => {
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightGray } };
		cell.border = { bottom: { style: 'thin' } };
	});
	r++;

	for (const [i, [productName, items]] of entries.entries()) {
		if (i > 0) setRowBottomBorder(r - 1, 'medium');

		ws.getCell(r, 1).value = productName;
		ws.getCell(r, 1).font = { bold: true };
		r++;

		for (const li of items) {
			ws.getCell(r, 1).value = li.name;
			ws.getCell(r, 2).value = productName;
			ws.getCell(r, 3).value = toYMD(li.startDate);
			ws.getCell(r, 4).value = toYMD(li.endDate);
			ws.getCell(r, 5).value = li.rateType;
			ws.getCell(r, 6).value = toN(li.rate);
			ws.getCell(r, 6).numFmt = numFmt;
			ws.getCell(r, 7).value = toN(li.quantity);
			ws.getCell(r, 7).numFmt = Number.isInteger(toN(li.quantity)) ? '#,##0' : numFmt;
			ws.getCell(r, 8).value = toN(li.subtotal);
			ws.getCell(r, 8).numFmt = moneyFmt;
			r++;
		}

		const groupTotal = items.reduce((s, li) => s + toN(li.subtotal), 0);
		ws.getCell(r, 1).value = `TOTAL (${productName})`;
		ws.getCell(r, 1).font = { bold: true };
		ws.getCell(r, 8).value = groupTotal;
		ws.getCell(r, 8).numFmt = moneyFmt;
		r++;
	}

	ws.getRow(r).height = 6;
	setRowBottomBorder(r, 'thick');
	r++;

	ws.getCell(r, 1).value = 'GRAND TOTAL';
	ws.getCell(r, 1).font = { bold: true };
	ws.getCell(r, 8).value = totalSpend;
	ws.getCell(r, 8).numFmt = moneyFmt;

	const buf = await wb.xlsx.writeBuffer();
	return Buffer.from(buf);
}
