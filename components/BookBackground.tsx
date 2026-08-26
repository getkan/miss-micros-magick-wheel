'use client'

import { useMemo, type CSSProperties } from 'react'
import BookIcon from '@/components/BookIcon'

type LayerConfig = {
    percent: number
    minBands: number
    maxBands: number
    duration: number
}

type BookPlacement = {
    id: string
    top: number
}

function buildLayerBooks({ percent, minBands, maxBands }: LayerConfig) {
    const bandCount = Math.floor(Math.random() * (maxBands - minBands + 1)) + minBands

    return Array.from({ length: bandCount }, (_, index) => {
        const bandHeight = 100 / bandCount
        const top = ((index + 0.5) / bandCount) * 100 + (Math.random() - 0.5) * (bandHeight * 0.9)

        return {
            id: `${percent}-${index}-${Math.random()}`,
            top,
        }
    })
}

export default function BookBackground() {
    const layers = useMemo<LayerConfig[]>(() => [
        { percent: 0.9, minBands: 3, maxBands: 5, duration: 24 },
        { percent: 0.6, minBands: 4, maxBands: 6, duration: 18 },
        { percent: 0.4, minBands: 5, maxBands: 7, duration: 12 },
    ], [])

    const bookLayers = useMemo(
        () => layers.map((layer) => ({ ...layer, books: buildLayerBooks(layer) })),
        [layers],
    )

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden isolate">
            <style>{`
                @keyframes book-float-across {
                    0% {
                        transform: translate3d(-10vw, 0, 0) scale(0.85);
                    }
                    100% {
                        transform: translate3d(120vw, 0, 0) scale(1);
                    }
                }
            `}</style>

            {bookLayers.map((layer, index) => (
                <div
                    key={layer.percent}
                    className="absolute inset-0"
                    style={{ zIndex: index + 1 }}
                >
                    {layer.books.map((book: BookPlacement) => (
                        <div
                            key={book.id}
                            className="absolute"
                            style={
                                {
                                    top: `${book.top}%`,
                                    animation: `book-float-across ${layer.duration}s linear infinite`,
                                    animationDelay: `-${Math.random() * layer.duration}s`,
                                } as CSSProperties
                            }
                        >
                            <BookIcon percent={layer.percent} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}