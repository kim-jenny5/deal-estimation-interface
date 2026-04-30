'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { DateTime } from 'luxon';

import type { ExportJobSummary } from '@/util/export-jobs';

function formatJobDate(iso: string): string {
	return DateTime.fromISO(iso).toFormat('MMM d, yyyy, h:mm a');
}

export default function DownloadedTab({ jobs }: { jobs: ExportJobSummary[] }) {
	if (jobs.length === 0) {
		return (
			<div className='flex min-h-40 items-center justify-center text-sm text-neutral-400'>
				No exported files yet. Click &ldquo;Export&rdquo; to get started.
			</div>
		);
	}

	return (
		<div className='card'>
			<table className='min-w-full divide-y divide-neutral-300 text-sm text-neutral-800'>
				<thead className='bg-neutral-100 text-neutral-500 uppercase'>
					<tr>
						<th className='py-3 pr-4 pl-6 text-left font-normal'>Name</th>
						<th className='px-4 py-3 text-left font-normal'>Requested</th>
						<th className='py-3 pr-6 pl-4 text-right font-normal'>Status</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-100 bg-white'>
					{jobs.map((job) => (
						<tr key={job.id}>
							<td className='h-[52px] pr-4 pl-6'>{job.name}</td>
							<td className='h-[52px] px-4 text-neutral-500'>{formatJobDate(job.createdAt)}</td>
							<td className='h-[52px] pr-6 pl-4 text-right'>
								{job.status === 'complete' ? (
									<a
										href={`/api/export-jobs/${job.id}/download`}
										download={job.name}
										className='primary-btn inline-flex items-center gap-x-1.5'
									>
										<ArrowDownTrayIcon className='h-3.5 w-3.5' />
										Download
									</a>
								) : (
									<span className='inline-flex items-center gap-x-1.5 text-sm text-neutral-400'>
										<svg
											aria-hidden='true'
											className='h-3.5 w-3.5 animate-spin'
											viewBox='0 0 100 101'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												className='fill-neutral-200'
												d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
											/>
											<path
												className='fill-neutral-800'
												d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
											/>
										</svg>
										Processing…
									</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
