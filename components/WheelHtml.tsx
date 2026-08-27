'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { WheelEntry } from '@/lib/wheelTypes';

// The proposed HTML-in-Canvas APIs aren't in the standard typings yet.
type DrawElementImageContext = CanvasRenderingContext2D & {
    drawElementImage?: (element: Element, dx: number, dy: number) => void;
};

type PaintCapableCanvas = HTMLCanvasElement & {
    onpaint?: (() => void) | null;
    requestPaint?: () => void;
};

export type WheelState = 'idle' | 'running' | 'winner';

interface Props {
    entries: WheelEntry[];
    className?: string;
    isClub?: boolean
    onWinner?: (entry: WheelEntry) => void;
}

interface SliceSpec {
    label: string;
    angle: number;
    sweep: number;
    color: string;
}

const MAX_SIZE = 1280;
const TWO_PI = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;

const YELLOW_HUE = 60;
const RIM_COLOR = '#f5f5f5';
const LABEL_COLOR = '#ffffff';

const IDLE_SPEED = 0.12;

// Slice geometry cached across frames: rebuilt only when entries/isClub change.
interface SliceGeometry {
    fontSize: number;
    inset: number;
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

// Builds the slice table once per entries/isClub change; the same table feeds the
// canvas fallback children and the geometry cache.
function buildSlices(entries: WheelEntry[], isClub: boolean): SliceSpec[] {
    const total = totalSlices(entries);
    if (total <= 0) return [];

    const slices: SliceSpec[] = [];
    let angle = START_ANGLE;
    const sliceSweep = TWO_PI / total;
    entries.forEach((entry, index) => {
        const color = segmentColor(index, entries.length);
        const sweep = isClub ? sliceSweep : entry.weight * sliceSweep;
        const repeat = isClub ? entry.weight : 1;
        for (let slice = 0; slice < repeat; slice += 1) {
            slices.push({ label: entry.title, angle, sweep, color });
            angle += sweep;
        }
    });
    return slices;
}

function renderSlices(slices: SliceSpec[]){
    // `drawable` is a proposed HTML attribute unknown to React's types; spread bypasses checking.
    const drawable = { ...({ drawable: '' } as Record<string, string>) };
    const labelStyle = {
        color: LABEL_COLOR,
        fontWeight: 600,
        fontFamily: '"SF Mono Regular", monospace',
        whiteSpace: 'nowrap',
    } as const;

    const clickHander = (label:string) => {
        alert(label)
    }

    return slices.map((slice, index) => (
        <button onClick={() => clickHander(slice.label)} key={`${slice.label}-${index}`} {...drawable} style={labelStyle}>{slice.label}</button>
    ));
}

// Precomputes size-dependent geometry so the animation frame loop reads cached
// numbers without allocating per-slice objects on every frame.
function renderSliceSpecs(sliceCount: number, size: number, isClub: boolean): SliceGeometry[] {
    if (sliceCount === 0) return [];

    const center = size / 2;
    const radius = center * 0.86;
    const inset = size * 0.035;
    const sliceSweep = TWO_PI / sliceCount;
    const fontSize = Math.max(isClub ? 8 : 12, Math.min(size * 0.02, radius * sliceSweep * 0.95));

    const geometry: SliceGeometry[] = new Array(sliceCount);
    for (let i = 0; i < sliceCount; i += 1) {
        geometry[i] = { fontSize, inset };
    }
    return geometry;
}

function drawSlice(
    slice: Element | undefined,
    sliceSpec: SliceSpec,
    geometry: SliceGeometry,
    context: DrawElementImageContext,
    center: number,
    radius: number,
    rotation: number,
) {
    if (!slice || !sliceSpec || !geometry) return;
    const angle = sliceSpec.angle;
    const sweep = sliceSpec.sweep;
    const { color, label } = sliceSpec;
    const fontSize = geometry.fontSize;
    const inset = geometry.inset;

    context.save();
    context.translate(center, center);

    // Wedge fill (previous version built the path around (0,0) and never called fill()).
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, angle + rotation, angle + rotation + sweep);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    // Clip so labels can't spill into neighbouring slices or past the rim.
    context.clip();

    // Rotate to the slice mid-angle so the label reads along the radius.
    const mid = angle + rotation + sweep / 2;
    context.rotate(mid);

    // HTML-in-Canvas (Chrome Canary, chrome://flags/#canvas-draw-element): draw the
    // drawable element snapshot; otherwise fall back to plain canvas text.
    if (slice && typeof context.drawElementImage === 'function') {
        const el = slice as HTMLElement;
        context.drawElementImage(slice, inset, -el.offsetHeight / 2);
    } else {
        context.fillStyle = LABEL_COLOR;
        context.font = `600 ${fontSize}px "SF Mono Regular", monospace`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(label, radius * 0.25, 0);
    }

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

function draw(canvas: PaintCapableCanvas, slices: SliceSpec[], size: number, rotation: number, isClub: boolean) {
    const context = canvas.getContext('2d') as DrawElementImageContext | null;
    if (!context) return;

    // Reallocating canvas.width/height wipes the backing store every frame, so only
    // resize when the bucket size actually changed.
    const ratio = window.devicePixelRatio || 1;
    const targetWidth = size * ratio;
    if (canvas.width !== targetWidth) {
        canvas.width = targetWidth;
        canvas.height = targetWidth;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);

    const center = size / 2;
    // The outer margin leaves room for the pointer.
    const radius = center * 0.86;

    const geometry = renderSliceSpecs(slices.length, size, isClub);
    const children = canvas.children;
    for (let i = 0; i < slices.length; i += 1) {
        drawSlice(children[i] as Element | undefined, slices[i], geometry[i], context, center, radius, rotation);
    }

    context.beginPath();
    context.arc(center, center, radius, 0, TWO_PI);
    context.strokeStyle = RIM_COLOR;
    context.lineWidth = 4;
    context.stroke();

    drawPointer(context, center, radius, size);
}


export default function WheelCanvas({ entries, className = '', isClub = true, onWinner }: Props) {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const spinRef = useRef<{ start: number; from: number; to: number; duration: number; index: number } | null>(null);

    const [state, setState] = useState<WheelState>('idle');

    // Built once per entries/isClub change; shared by the JSX children and the draw loop.
    const slices = useMemo(() => buildSlices(entries, isClub), [entries, isClub]);

    useEffect(() => {

        const container = containerRef.current;
        const canvas = canvasRef.current as PaintCapableCanvas | null;
        const size = Math.min(container?.clientWidth ?? 0, MAX_SIZE);
        if (!container || !canvas || size === 0) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const render = () => draw(canvas, slices, size, rotationRef.current, isClub);
        const request = () => canvas.requestPaint?.();

        // When HTML-in-Canvas is available, snapshots of `drawable` children are only
        // recorded during the browser's rendering update, so drawing must only happen in
        // the canvas `paint` event. Calling `drawElementImage` before the first snapshot
        // exists throws InvalidStateError.
        const supportsDrawElement =
            typeof (canvas.getContext('2d') as DrawElementImageContext | null)?.drawElementImage ===
            'function';

        if (supportsDrawElement) {
            canvas.onpaint = render;
        }

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
            }

            request();
            frameId = requestAnimationFrame(frame);
        };

        if (state === 'winner') {
            // Static render; no animation loop needed.
            request();
        } else {
            frameId = requestAnimationFrame(frame);
        }

        const observer = new ResizeObserver(request);
        observer.observe(container);

        return () => {
            cancelAnimationFrame(frameId);
            observer.disconnect();
            canvas.onpaint = null;
        };
    }, [slices, isClub, state]);
    
    return (
        <div className={`flex w-full flex-col items-center gap-4 ${className}`}>
            <div ref={containerRef} className="flex w-full justify-center">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`Wheel with ${slices.length} recommendations: ${entries
                        .map((entry) => entry.title)
                        .join(', ')}`}
                    {...({ layoutsubtree: '' } as Record<string, string>)}
                >
                    {renderSlices(slices)}
                </canvas>
            </div>
        </div>
    );
}
