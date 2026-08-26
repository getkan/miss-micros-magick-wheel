'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import type { WheelEntry } from '@/lib/wheelTypes';

interface Props {
    winner: WheelEntry;
    onClose: () => void;
}

const FLYING_WHEEL_COUNT = 16;

interface FlyingWheel {
    top: number;
    size: number;
    duration: number;
    delay: number;
    reverse: boolean;
}

function createFlyingWheels(): FlyingWheel[] {
    return Array.from({ length: FLYING_WHEEL_COUNT }, () => ({
        top: Math.random() * 92,
        size: 32 + Math.random() * 72,
        duration: 3.5 + Math.random() * 4,
        delay: Math.random() * -6,
        reverse: Math.random() < 0.5
    }));
}

export default function WinnerModal({ winner, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    // Generated once so the icons keep a stable path for the life of the modal.
    const wheels = useMemo(() => createFlyingWheels(), []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog?.open) dialog?.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            aria-labelledby="winner-modal-title"
            className="h-full max-h-full w-full max-w-full bg-transparent backdrop:bg-black/80"
        >
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
                {wheels.map((wheel, index) => (
                    <Image
                        key={index}
                        src="/wheel.svg"
                        alt=""
                        width={wheel.size}
                        height={wheel.size}
                        className={wheel.reverse ? 'animate-fly-right-to-left' : 'animate-fly-left-to-right'}
                        style={{
                            position: 'absolute',
                            top: `${wheel.top}%`,
                            width: wheel.size,
                            height: wheel.size,
                            animationDuration: `${wheel.duration}s`,
                            animationDelay: `${wheel.delay}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative flex h-full w-full items-center justify-center p-4">
                <div className="border-offwhite bg-background text-offwhite flex w-full max-w-150 flex-col gap-4 rounded-lg border-2 p-8 text-center">
                    <p className="text-highlight-light text-lg">The Wheel has chosen</p>
                    <h2 id="winner-modal-title" className="text-[1.75rem] font-bold sm:text-[2.5rem]">
                        {winner.title}
                    </h2>
                    {winner.recommender ? <p className="text-xl">Recommended by {winner.recommender}</p> : null}
                    <button
                        type="button"
                        autoFocus
                        onClick={() => dialogRef.current?.close()}
                        className="border-offwhite mx-auto mt-2 cursor-pointer rounded-lg border-2 px-6 py-2 text-lg font-bold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    );
}
