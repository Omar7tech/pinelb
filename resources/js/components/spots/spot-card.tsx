import { usePage } from '@inertiajs/react';
import { CalendarCheck, Eye, Lock } from 'lucide-react';
import { memo, useState } from 'react';
import { ProductPrice } from '@/components/menu/product-price';
import { SpotCover } from '@/components/spots/spot-cover';
import { SpotDialog } from '@/components/spots/spot-dialog';
import { cn, isArabic } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Spot } from '@/types';

interface SpotCardProps {
    spot: Spot;
}

/**
 * A single bookable spot: its lead photo, name, a one-line teaser and price,
 * with the reserve action underneath. Tapping the card — or the view button —
 * opens the details dialog holding the rest of the photos and copy. A spot
 * already taken keeps its card but trades the action for a "reserved" notice.
 */
function SpotCardComponent({ spot }: SpotCardProps) {
    // Reservations are handled over chat. Without a usable number the card just
    // shows its details, since there is nowhere to send the request.
    const contactNumber = usePage().props.reservations.phoneNumber;

    const [open, setOpen] = useState(false);

    // Right-align and flip the text block to RTL when the name is Arabic.
    const rtl = isArabic(spot.name);

    return (
        <>
            <div
                className={cn(
                    'group relative flex h-full min-w-0 flex-col rounded-[1.5rem] border border-primary/15 bg-card/60 p-3 transition-all duration-300 focus-within:border-primary/35',
                    spot.is_reserved
                        ? 'opacity-75'
                        : 'hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_32px_-24px_rgba(120,137,108,0.9)]',
                )}
            >
                {/* The details trigger covers the whole card, so the heading and
                    copy can stay real block elements outside the button. */}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="absolute inset-0 z-0 rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <span className="sr-only">View {spot.name}</span>
                </button>

                {/* Without a photo the badge has nothing to sit on, so it leads
                    the card instead of floating over an empty box. */}
                {spot.images.length > 0 ? (
                    <div className="pointer-events-none relative">
                        <SpotCover images={spot.images} name={spot.name} />

                        {spot.is_reserved && (
                            <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-brick px-3 py-1 text-[10px] tracking-[0.16em] text-primary-foreground uppercase">
                                <Lock aria-hidden className="size-3" />
                                Reserved
                            </span>
                        )}
                    </div>
                ) : (
                    spot.is_reserved && (
                        <span className="pointer-events-none inline-flex w-fit items-center gap-1.5 rounded-full bg-brick px-3 py-1 text-[10px] tracking-[0.16em] text-primary-foreground uppercase">
                            <Lock aria-hidden className="size-3" />
                            Reserved
                        </span>
                    )
                )}

                <div className="pointer-events-none mt-3 flex min-w-0 flex-1 flex-col">
                    <h2
                        dir={rtl ? 'rtl' : undefined}
                        className={cn(
                            'min-w-0 text-xl leading-tight font-semibold text-primary',
                            rtl && 'text-right',
                        )}
                    >
                        {spot.name}
                    </h2>

                    {spot.description && (
                        <p
                            dir={rtl ? 'rtl' : undefined}
                            className={cn(
                                'mt-1 line-clamp-1 text-xs text-muted-foreground/80',
                                rtl && 'text-right',
                            )}
                        >
                            {spot.description}
                        </p>
                    )}

                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        {spot.price !== null ? (
                            <ProductPrice
                                basePrice={spot.price}
                                discountPrice={spot.discount_price}
                            />
                        ) : (
                            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                                Price on request
                            </span>
                        )}

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                aria-label={`View ${spot.name}`}
                                className="pointer-events-auto relative z-10 inline-flex size-9 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Eye className="size-4" />
                            </button>

                            {spot.is_reserved ? (
                                <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                                    Not available
                                </span>
                            ) : (
                                contactNumber && (
                                    <a
                                        href={buildWhatsAppUrl(
                                            contactNumber,
                                            `Hi! I'd like to reserve "${spot.name}".`,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="pointer-events-auto relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <CalendarCheck
                                            aria-hidden
                                            className="size-4"
                                        />
                                        Reserve
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SpotDialog
                spot={spot}
                open={open}
                onOpenChange={setOpen}
                contactNumber={contactNumber}
            />
        </>
    );
}

/**
 * Memoized to match the menu's product cards, so a re-render of the page shell
 * doesn't rebuild every card in the grid.
 */
export const SpotCard = memo(SpotCardComponent);
