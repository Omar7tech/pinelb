import { Lock, Minus, Plus, RotateCcw } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpotFilterValue } from '@/components/spots/spot-filter';
import { cn } from '@/lib/utils';
import type { Spot } from '@/types';

interface SpotMapViewProps {
    /** Every spot on the page; the ones without a pin are simply not drawn. */
    spots: Spot[];
    /** The uploaded floor plan. */
    image: string;
    /** Pins outside this side fade back and stop being tappable. */
    filter: SpotFilterValue;
    onSelect: (spot: Spot) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

/** A spot is drawn on the map only once both of its coordinates are set. */
function isPlaced(spot: Spot): spot is Spot & { map_x: number; map_y: number } {
    return spot.map_x !== null && spot.map_y !== null;
}

/**
 * The floor plan with a pin per placed spot. The map fits its column at rest,
 * and can be zoomed — wheel, pinch or the buttons — and dragged around once
 * it's larger than its frame, so a crowded corner can be read on a phone.
 *
 * Pins keep their size whatever the zoom: they're counter-scaled, so a pin
 * stays tappable rather than growing into a slab.
 */
export function SpotMapView({
    spots,
    image,
    filter,
    onSelect,
}: SpotMapViewProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Live pointers on the map, so one finger pans and two pinch.
    const pointersRef = useRef(new Map<number, { x: number; y: number }>());
    const panRef = useRef<{ x: number; y: number } | null>(null);
    const pinchRef = useRef<number | null>(null);
    // A drag that moved swallows the click that follows it, so panning across a
    // pin doesn't open its details.
    const movedRef = useRef(false);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const placed = spots.filter(isPlaced);
    const missing = spots.length - placed.length;

    /** Keep the plan covering its frame however far it has been dragged. */
    const clampOffset = useCallback(
        (next: { x: number; y: number }, nextScale: number) => {
            const viewport = viewportRef.current;
            const canvas = canvasRef.current;

            if (!viewport || !canvas) {
                return next;
            }

            const spare = {
                x: viewport.clientWidth - canvas.offsetWidth * nextScale,
                y: viewport.clientHeight - canvas.offsetHeight * nextScale,
            };

            return {
                x: spare.x >= 0 ? spare.x / 2 : clamp(next.x, spare.x, 0),
                y: spare.y >= 0 ? spare.y / 2 : clamp(next.y, spare.y, 0),
            };
        },
        [],
    );

    /** Zoom towards a point of the frame, keeping it under the pointer. */
    const zoomTo = useCallback(
        (nextScale: number, focus?: { x: number; y: number }) => {
            const viewport = viewportRef.current;

            if (!viewport) {
                return;
            }

            const rect = viewport.getBoundingClientRect();
            const point = focus ?? {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
            const local = { x: point.x - rect.left, y: point.y - rect.top };

            setScale((current) => {
                const target = clamp(nextScale, MIN_SCALE, MAX_SCALE);
                const ratio = target / current;

                setOffset((previous) =>
                    clampOffset(
                        {
                            x: local.x - (local.x - previous.x) * ratio,
                            y: local.y - (local.y - previous.y) * ratio,
                        },
                        target,
                    ),
                );

                return target;
            });
        },
        [clampOffset],
    );

    const reset = useCallback((): void => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // React listens for wheel passively, so the zoom is bound by hand to keep
    // the page from scrolling under the gesture.
    useEffect(() => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        const onWheel = (event: WheelEvent): void => {
            event.preventDefault();

            zoomTo(scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15), {
                x: event.clientX,
                y: event.clientY,
            });
        };

        viewport.addEventListener('wheel', onWheel, { passive: false });

        return () => viewport.removeEventListener('wheel', onWheel);
    }, [zoomTo, scale]);

    // The plan shrinks with the window; re-clamp so no gap creeps in at the edge.
    useEffect(() => {
        const onResize = (): void =>
            setOffset((previous) => clampOffset(previous, scale));

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, [clampOffset, scale]);

    const pointerCentre = (): { x: number; y: number } => {
        const points = [...pointersRef.current.values()];

        return {
            x:
                points.reduce((total, point) => total + point.x, 0) /
                points.length,
            y:
                points.reduce((total, point) => total + point.y, 0) /
                points.length,
        };
    };

    const pointerSpread = (): number => {
        const [first, second] = [...pointersRef.current.values()];

        return Math.hypot(second.x - first.x, second.y - first.y);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        movedRef.current = false;

        if (pointersRef.current.size === 1) {
            panRef.current = {
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            };

            return;
        }

        if (pointersRef.current.size === 2) {
            panRef.current = null;
            pinchRef.current = pointerSpread();
        }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!pointersRef.current.has(event.pointerId)) {
            return;
        }

        pointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        if (pointersRef.current.size >= 2) {
            const spread = pointerSpread();
            const previous = pinchRef.current;
            pinchRef.current = spread;

            if (previous && previous > 0) {
                movedRef.current = true;
                zoomTo(scale * (spread / previous), pointerCentre());
            }

            return;
        }

        const start = panRef.current;

        if (!start) {
            return;
        }

        movedRef.current = true;
        setOffset(
            clampOffset(
                { x: event.clientX - start.x, y: event.clientY - start.y },
                scale,
            ),
        );
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        pointersRef.current.delete(event.pointerId);

        if (pointersRef.current.size < 2) {
            pinchRef.current = null;
        }

        panRef.current =
            pointersRef.current.size === 1
                ? (() => {
                      const [point] = [...pointersRef.current.values()];

                      return { x: point.x - offset.x, y: point.y - offset.y };
                  })()
                : null;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-card/60">
                <div
                    ref={viewportRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onDoubleClick={(event) =>
                        zoomTo(scale > 1 ? 1 : 2, {
                            x: event.clientX,
                            y: event.clientY,
                        })
                    }
                    className={cn(
                        'relative touch-none overflow-hidden select-none',
                        scale > 1 ? 'cursor-grab' : 'cursor-default',
                    )}
                >
                    <div
                        ref={canvasRef}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                        }}
                        className="relative w-full origin-top-left"
                    >
                        <img
                            src={image}
                            alt="Map of the spots"
                            draggable={false}
                            className="block h-auto w-full"
                        />

                        {placed.map((spot) => {
                            const matches =
                                filter === 'reserved'
                                    ? spot.is_reserved
                                    : !spot.is_reserved;

                            return (
                                <div
                                    key={spot.id}
                                    style={{
                                        left: `${spot.map_x}%`,
                                        top: `${spot.map_y}%`,
                                    }}
                                    className="absolute -translate-x-1/2 -translate-y-full"
                                >
                                    <div
                                        style={{
                                            transform: `scale(${1 / scale})`,
                                            transformOrigin: 'bottom center',
                                        }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <button
                                            type="button"
                                            onPointerDown={(event) =>
                                                event.stopPropagation()
                                            }
                                            onClick={() => {
                                                if (movedRef.current) {
                                                    return;
                                                }

                                                onSelect(spot);
                                            }}
                                            disabled={!matches}
                                            aria-label={`${spot.name} — ${
                                                spot.is_reserved
                                                    ? 'reserved'
                                                    : 'available'
                                            }`}
                                            className={cn(
                                                'flex max-w-28 flex-col items-center gap-1 transition-opacity',
                                                matches
                                                    ? 'cursor-pointer opacity-100'
                                                    : 'pointer-events-none opacity-35',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'grid size-7 place-items-center rounded-full border-2 border-background text-primary-foreground shadow-[0_6px_14px_-8px_rgba(15,23,42,0.9)]',
                                                    spot.is_reserved
                                                        ? 'bg-brick'
                                                        : 'bg-primary',
                                                )}
                                            >
                                                {spot.is_reserved ? (
                                                    <Lock
                                                        aria-hidden
                                                        className="size-3.5"
                                                    />
                                                ) : (
                                                    <span className="size-2 rounded-full bg-primary-foreground" />
                                                )}
                                            </span>

                                            <span className="max-w-28 truncate rounded-full bg-background/85 px-2 py-0.5 text-[10px] text-primary backdrop-blur">
                                                {spot.name}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Zoom controls, for the mice and keyboards that can't pinch. */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 rounded-full border border-primary/15 bg-background/85 p-1 backdrop-blur">
                    <button
                        type="button"
                        onClick={() => zoomTo(scale * 1.4)}
                        disabled={scale >= MAX_SCALE}
                        aria-label="Zoom in"
                        className="grid size-8 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        <Plus className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => zoomTo(scale / 1.4)}
                        disabled={scale <= MIN_SCALE}
                        aria-label="Zoom out"
                        className="grid size-8 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        <Minus className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        disabled={scale === MIN_SCALE}
                        aria-label="Reset the map"
                        className="grid size-8 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        <RotateCcw className="size-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-primary" />
                        Available
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-brick" />
                        Reserved
                    </span>
                </div>

                {missing > 0 && (
                    <span>
                        {missing} {missing === 1 ? 'spot is' : 'spots are'} not
                        on the map yet — they're in the cards.
                    </span>
                )}
            </div>
        </div>
    );
}
