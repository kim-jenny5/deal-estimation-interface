import { formatInitials } from '@/util/formatters';

import ResetDatabaseBtn from './ResetDatabaseBtn';

export default function Navbar({ user }: { user: string }) {
	return (
		<nav className='wrapper justify-end border-b border-black/25'>
			<div className='flex items-center gap-x-4'>
				<ResetDatabaseBtn />
				<div className='flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-800'>
					{formatInitials(user)}
				</div>
			</div>
		</nav>
	);
}
