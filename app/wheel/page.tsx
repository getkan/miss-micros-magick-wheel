import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WheelCanvas from '@/components/WheelCanvas';
import { getWheelEntries, type WheelEntry } from '@/lib/googleSheets';

export const revalidate = 300;

function WheelLoading() {
    return (
        <div className="flex flex-col items-center gap-4 py-12" role="status" aria-live="polite">
            <Image
                src="/wheel.svg"
                alt=""
                aria-hidden="true"
                height={64}
                width={64}
                className="animate-spin"
                priority
            />
            <p className="text-lg">Consulting the sheet of destiny...</p>
        </div>
    );
}

function WheelMessage({ tone, children }: { tone: 'error' | 'info'; children: React.ReactNode }) {
    return (
        <p
            role={tone === 'error' ? 'alert' : undefined}
            className={`rounded-lg border-2 p-4 text-lg ${
                tone === 'error' ? 'border-offwhite' : 'border-highlight-light'
            }`}
        >
            {children}
        </p>
    );
}

function EntryList({ entries }: { entries: WheelEntry[] }) {
    const totalSlices = entries.reduce((total, entry) => total + entry.weight, 0);

    return (
        <>
            <WheelCanvas entries={entries} />
            <p className="text-highlight-light">
                {entries.length} recommendations across {totalSlices} wheel slices.
            </p>
            <ul className="flex flex-col gap-2">
                {entries.map((entry, index) => (
                    <li key={entry.id} className="border-highlight-dark flex flex-wrap gap-x-3 border-b-2 pb-2 text-lg">
                        <span className="text-highlight-light tabular-nums">{index + 1}.</span>
                        <span className="font-bold">{entry.title}</span>
                        {entry.recommender ? (
                            <span className="text-highlight-light">from {entry.recommender}</span>
                        ) : null}
                        <span className="text-highlight-light ml-auto tabular-nums">
                            {entry.weight} {entry.weight === 1 ? 'slice' : 'slices'}
                        </span>
                    </li>
                ))}
            </ul>
        </>
    );
}

async function WheelData() {
    const result = await getWheelEntries();

    if (result.status === 'not-configured') {
        return <WheelMessage tone="error">{result.message}</WheelMessage>;
    }

    if (result.status === 'error') {
        return (
            <WheelMessage tone="error">
                {result.message} Check the spreadsheet id, range, and sharing settings, then reload.
            </WheelMessage>
        );
    }

    if (result.status === 'empty') {
        return <WheelMessage tone="info">The sheet has no book recommendations yet. Add a row and reload.</WheelMessage>;
    }

    if (result.entries.length < 2) {
        return (
            <>
                <WheelMessage tone="info">
                    The Wheel needs at least two books before it can spin. Add another row to the sheet.
                </WheelMessage>
                <EntryList entries={result.entries} />
            </>
        );
    }

    return <EntryList entries={result.entries} />;
}

export default function WheelPage() {
    return (
        <main className="border-offwhite bg-background relative flex flex-col gap-4 rounded-lg border-2 p-8 md:min-w-200">
            <h1 className="text-[1.5rem] font-bold sm:text-[2rem]">The Wheel&#x27;s Contenders</h1>
            <Suspense fallback={<WheelLoading />}>
                <WheelData />
            </Suspense>
            <Link href="/" className="mt-4 flex w-fit items-baseline gap-2 rounded-lg p-2">
                <span className="text-[2rem] leading-4">←</span>Back Home
            </Link>
        </main>
    );
}