import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: `Deal Estimation Interface`,
	description: `Estimate campaign spend with clarity.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className='antialiased'>{children}</body>
		</html>
	);
}
