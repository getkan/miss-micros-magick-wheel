'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WinnerModal from '@/components/WinnerModal';
import type { WheelEntry } from '@/lib/wheelTypes';

export type WheelState = 'idle' | 'running' | 'winner';

interface Props {
    entries: WheelEntry[];
    className?: string;
    isClub?: boolean
    onWinner?: (entry: WheelEntry) => void;
}

const MAX_SIZE = 1280;
const TWO_PI = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;
/** The arrow sits on the right edge, so the winning segment is the one at 0 radians. */
const POINTER_ANGLE = 0;
const YELLOW_HUE = 60;
const RIM_COLOR = '#f5f5f5';
const LABEL_COLOR = '#ffffff';

const IDLE_SPEED = 0.12;
const SPIN_TURNS = 24;
const SPIN_DURATION = 30000;
const REDUCED_SPIN_DURATION = 15000;

const SPIN_MUSIC_SRC = '/extreme-spiderman-bullshit.mp3';
const SPIN_MUSIC_VOLUME = 1;

const BOOST_TURNS = 6;
const BOOST_PLAYBACK_STEP = 0.25;
const MAX_PLAYBACK_RATE = 4;


// Cached image for the pointer. Loaded once per module, not per frame.
let pointerImage: HTMLImageElement | null = null;
function getPointerImage(): HTMLImageElement {
    if (!pointerImage) {
        pointerImage = new Image();
        pointerImage.src = '/hotdog.png';
    }
    return pointerImage;
}


/** Spreads entries around the colour wheel, starting from yellow. */
function segmentColor(index: number, count: number): string {
    const hue = (YELLOW_HUE + (index * 360) / count) % 360;

    return `hsl(${hue} 78% 58%)`;
}

function normalizeAngle(angle: number): number {
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

function easeOutCubic(progress: number): number {
    return 1 - (1 - progress) ** 3;
}

function totalSlices(entries: WheelEntry[]): number {
    return entries.reduce((total, entry) => total + entry.weight, 0);
}

/** Mid-angle of a segment before any rotation is applied. */
function segmentMidAngle(entries: WheelEntry[], index: number): number {
    const total = totalSlices(entries);
    let angle = START_ANGLE;

    for (let i = 0; i < index; i += 1) {
        angle += (entries[i].weight / total) * TWO_PI;
    }

    return angle + ((entries[index].weight / total) * TWO_PI) / 2;
}

function pickWeightedIndex(entries: WheelEntry[]): number {
    let ticket = Math.random() * totalSlices(entries);

    for (let i = 0; i < entries.length; i += 1) {
        ticket -= entries[i].weight;
        if (ticket <= 0) return i;
    }

    return entries.length - 1;
}

function drawSlice(
    context: CanvasRenderingContext2D,
    center: number,
    radius: number,
    angle: number,
    sweep: number,
    color: string,
    label: string,
    fontSize: number,
    inset: number
) {
    context.save();
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, angle, angle + sweep);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    // Keep long titles inside their own slice instead of spilling into neighbours.
    context.clip();

    context.translate(center, center);
    context.rotate(angle + sweep / 2);
    context.fillStyle = LABEL_COLOR;
    context.font = `600 ${fontSize}px "SF Mono Regular", monospace`;
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillText(label, radius - inset, 0);
    context.restore();
}

function drawPointer(context: CanvasRenderingContext2D, center: number, radius: number, size: number) {
    const tipX = center + radius - size * 0.01;
    const backX = center + radius + size * 0.075;
    const halfHeight = size * 0.045;

    context.beginPath();
    context.moveTo(tipX, center);
    context.lineTo(backX, center - halfHeight);
    context.lineTo(backX, center + halfHeight);
    context.closePath();
    context.fillStyle = RIM_COLOR;
    context.fill();
    context.lineWidth = 2;
    context.stroke();
}

function drawHotdog(context: CanvasRenderingContext2D, center: number, radius: number, size: number) {
    const img = getPointerImage();
    // Skip drawing until the image has decoded; the next frame will pick it up.
    if (!img.complete || img.naturalWidth === 0) return;

    const tipX = center + radius - size * 0.05;
    const backX = center + radius + size * 0.1;
    const pointerWidth = backX - tipX;
    const pointerHeight = img.naturalHeight / img.naturalWidth * pointerWidth;

    // Pointing left toward the wheel; rotate 180° so the image's natural left is the tip.
    context.save();
    context.translate(tipX + pointerWidth / 2, center);
    context.rotate(-30 * Math.PI / 180);
    context.drawImage(img, -pointerWidth / 2, -pointerHeight / 2, pointerWidth, pointerHeight);
    context.restore();
}



function draw(canvas: HTMLCanvasElement, entries: WheelEntry[], size: number, rotation: number, isClub: boolean) {
    const context = canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);

    const center = size / 2;
    // The outer margin leaves room for the pointer.
    const radius = center * 0.86;
    const total = totalSlices(entries);
    if (total <= 0) return;

    let angle = START_ANGLE + rotation;
    // Every weight unit is its own labelled slice.
    const sliceSweep = TWO_PI / total;
    const fontSize = Math.max(8, Math.min(size * 0.02, radius * sliceSweep * 0.95));
    const largeFontSize = Math.max(12, Math.min(size * 0.02, radius * sliceSweep * 0.95));
    const inset = size * 0.035;

    entries.forEach((entry, index) => {
        const color = segmentColor(index, entries.length);

        if(isClub){
            for (let slice = 0; slice < entry.weight; slice += 1) {
                drawSlice(context, center, radius, angle, sliceSweep, color, entry.title, fontSize, inset);
                angle += sliceSweep;
            }
        } else {
            const sweep = entry.weight * sliceSweep;
            drawSlice(context, center, radius, angle, sweep, color, entry.title, largeFontSize, inset);
            angle += sweep;
        }

    });

    context.beginPath();
    context.arc(center, center, radius, 0, TWO_PI);
    context.strokeStyle = RIM_COLOR;
    context.lineWidth = 4;
    context.stroke();

    if(isClub){
        drawHotdog(context, center, radius, size);
    } else {
        drawPointer(context, center, radius, size);
    }
}

export default function WheelCanvas({ entries, className = '', isClub = true, onWinner }: Props) {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const rotationRef = useRef(0);
    const spinRef = useRef<{ start: number; from: number; to: number; duration: number; index: number } | null>(null);

    const [state, setState] = useState<WheelState>('idle');
    const [winner, setWinner] = useState<WheelEntry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isAudioUnavailable, setIsAudioUnavailable] = useState(false);

    const canSpin = entries.length > 1;

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const render = () => {
            const size = Math.min(container.clientWidth, MAX_SIZE);
            if (size > 0) draw(canvas, entries, size, rotationRef.current, isClub);
        };

        const observer = new ResizeObserver(render);
        observer.observe(container);

        let frameId = 0;
        let last = performance.now();

        const frame = (now: number) => {
            const delta = (now - last) / 1000;
            last = now;

            if (state === 'idle' && !reduceMotion) {
                rotationRef.current = normalizeAngle(rotationRef.current + IDLE_SPEED * delta);
            } else if (state === 'running' && spinRef.current) {
                const spin = spinRef.current;
                const progress = Math.min(1, (now - spin.start) / spin.duration);
                rotationRef.current = spin.from + (spin.to - spin.from) * easeOutCubic(progress);

                if (progress >= 1) {
                    rotationRef.current = normalizeAngle(spin.to);
                    spinRef.current = null;
                    setWinner(entries[spin.index]);
                    setIsModalOpen(true);
                    setState('winner');
                    onWinner?.(entries[spin.index]);
                }
            }

            render();
            frameId = requestAnimationFrame(frame);
        };

        if (state === 'winner') {
            render();
        } else {
            frameId = requestAnimationFrame(frame);
        }

        return () => {
            cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, [entries, state, onWinner, isClub]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (state !== 'running') {
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        audio.volume = SPIN_MUSIC_VOLUME;
        audio.playbackRate = 1;
        audio.currentTime = 0;
        // Autoplay policies can still reject this even though a click started the spin.
        audio.play().catch(() => setIsAudioUnavailable(true));
    }, [state]);

    const spin = useCallback(() => {
        if (!canSpin || state === 'running') return;

        const index = pickWeightedIndex(entries);
        const from = rotationRef.current;
        const landing = normalizeAngle(POINTER_ANGLE - segmentMidAngle(entries, index));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const baseTurns = isClub ? SPIN_TURNS : SPIN_TURNS / 2
        const turns = reduceMotion ? 0 : baseTurns;

        spinRef.current = {
            start: performance.now(),
            from,
            to: from + turns * TWO_PI + normalizeAngle(landing - from),
            duration: reduceMotion || !isClub  ? REDUCED_SPIN_DURATION : SPIN_DURATION,
            index
        };

        setWinner(null);
        setIsModalOpen(false);
        setState('running');
    }, [canSpin, entries, state, isClub]);

    const speedUp = useCallback(() => {
        const spin = spinRef.current;
        if (state !== 'running' || !spin) return;



        if(isClub){
            // Whole extra turns cover more distance in the same time without moving the landing point.
            spin.to += BOOST_TURNS * TWO_PI;
            const audio = audioRef.current;
            if (audio) audio.playbackRate = Math.min(MAX_PLAYBACK_RATE, audio.playbackRate + BOOST_PLAYBACK_STEP);
        } else {
            spin.duration = spin.duration / 2
        }

    }, [state, isClub]);

    return (
        <div className={`flex w-full flex-col items-center gap-4 ${className}`}>
            {
                isClub
                && <audio
                    ref={audioRef}
                    src={SPIN_MUSIC_SRC}
                    loop
                    muted={isMuted}
                    preload="auto"
                    onError={() => setIsAudioUnavailable(true)}
                />
            }

            <div ref={containerRef} className="flex w-full justify-center">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`Wheel with ${entries.length} recommendations: ${entries
                        .map((entry) => entry.title)
                        .join(', ')}`}
                />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={state === 'running' ? speedUp : spin}
                    disabled={!canSpin}
                    className="border-offwhite rounded-lg border-2 px-6 py-2 text-lg font-bold disabled:opacity-50 cursor-pointer"
                >
                    {state === 'running' ? 'Speed Up' : state === 'winner' ? 'Spin Again' : 'Spin The Wheel'}
                </button>

                {
                    isClub &&
                    <button
                        type="button"
                        onClick={() => setIsMuted((muted) => !muted)}
                        disabled={isAudioUnavailable}
                        aria-pressed={isMuted}
                        className="border-offwhite text-xs cursor-pointer rounded-lg border-2 px-4 py-2 disabled:opacity-50"
                    >
                        {isAudioUnavailable ? 'Music Unavailable' : isMuted ? 'Unmute' : 'Mute'}
                    </button>
                }

            </div>

            <p role="status" aria-live="polite" className="min-h-7 text-lg">
                {winner ? `The Wheel choses ${winner.title}${winner.recommender ? `, from ${winner.recommender}` : ''}.` : ''}
            </p>

            {winner && isModalOpen ? <WinnerModal winner={winner} onClose={() => setIsModalOpen(false)} /> : null}
        </div>
    );
}
