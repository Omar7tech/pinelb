import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpotFilterValue } from '@/components/spots/spot-filter';
import { SpotPin } from '@/components/spots/spot-pin';
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
 * The floor plan with a marker per placed spot. The plan fits its frame at
 * rest, and can be zoomed by pinch, wheel or a double tap, then dragged around
 * once it's larger than the frame, so a crowded corner still reads on a phone.
 *
 * Nothing is laid over the plan itself: on a phone every control is a thumb in
 * the way, so the gestures carry the zoom and the frame stays clean.
 *
 * Coordinates are percentages of the image box, and every marker sits on that
 * point exactly as the admin editor places it. Markers are counter-scaled so
 * they keep their size — and their place — at any zoom.
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
    // Only bookable spots are missed from the map, since they're the ones the
    // cards can still show.
    const missing = spots.filter(
        (spot) => spot.is_reservable && !isPlaced(spot),
    ).length;

    /** Keep the plan covering, or centred in, its frame. */
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

    // The plan is centred once it has been measured, and re-centred whenever
    // the window changes its frame.
    useEffect(() => {
        const recentre = (): void =>
            setOffset((previous) => clampOffset(previous, scale));

        recentre();
        window.addEventListener('resize', recentre);

        return () => window.removeEventListener('resize', recentre);
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

        const [remaining] = [...pointersRef.current.values()];

        panRef.current = remaining
            ? { x: remaining.x - offset.x, y: remaining.y - offset.y }
            : null;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-primary/5">
                <div
                    ref={viewportRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onDoubleClick={(event) =>
                        zoomTo(scale > 1 ? 1 : 2.5, {
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
                        className="relative w-fit"
                    >
                        <img
                            src={image}
                            alt="Map of the spots"
                            draggable={false}
                            onLoad={() =>
                                setOffset((previous) =>
                                    clampOffset(previous, scale),
                                )
                            }
                            style={{ maxHeight: '72vh' }}
                            className="block h-auto w-auto max-w-full"
                        />

                        {placed.map((spot) => {
                            // A landmark answers "where is the WC", so it stays
                            // legible on both sides of the filter. It opens like
                            // any other pin — on its photos and its copy, with
                            // nothing to book.
                            const landmark = !spot.is_reservable;
                            const matches =
                                landmark ||
                                (filter === 'reserved'
                                    ? spot.is_reserved
                                    : !spot.is_reserved);

                            return (
                                <button
                                    key={spot.id}
                                    type="button"
                                    onPointerDown={(event) => {
                                        // The pin keeps the gesture to itself,
                                        // so it also has to clear the drag flag
                                        // the viewport would have cleared.
                                        event.stopPropagation();
                                        movedRef.current = false;
                                    }}
                                    onClick={() => {
                                        if (movedRef.current) {
                                            return;
                                        }

                                        onSelect(spot);
                                    }}
                                    disabled={!matches}
                                    aria-label={`${spot.name} — ${
                                        landmark
                                            ? 'facility'
                                            : spot.is_reserved
                                              ? 'reserved'
                                              : 'available'
                                    }`}
                                    style={{
                                        left: `${spot.map_x}%`,
                                        top: `${spot.map_y}%`,
                                        // The pin hangs by its tip from the
                                        // point and a landmark's diamond sits
                                        // centred on it, and both shrug off the
                                        // zoom so they keep their size.
                                        transform: landmark
                                            ? `translate(-50%, -50%) scale(${1 / scale})`
                                            : `translate(-50%, -100%) scale(${1 / scale})`,
                                        transformOrigin: landmark
                                            ? 'center'
                                            : 'bottom center',
                                    }}
                                    className={cn(
                                        'absolute transition-opacity duration-200',
                                        matches
                                            ? 'cursor-pointer opacity-100 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                                            : 'pointer-events-none opacity-30',
                                    )}
                                >
                                    <SpotPin
                                        reserved={spot.is_reserved}
                                        landmark={landmark}
                                        color={spot.pin_color}
                                        name={spot.name}
                                    />
                                </button>
                            );
                        })}
                    </div>
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
                    {placed.some((spot) => !spot.is_reservable) && (
                        <span className="inline-flex items-center gap-1.5">
                            {/* The swatch carries the marker's shape as well as
                                its colour, so the key matches the map. */}
                            <span className="size-2 rotate-45 rounded-[1px] bg-slate-500" />
                            Facilities
                        </span>
                    )}
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
