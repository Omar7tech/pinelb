import { usePage } from '@inertiajs/react';
import { CalendarCheck, Lock } from 'lucide-react';
import { memo } from 'react';
import { ProductPrice } from '@/components/menu/product-price';
import { SpotGallery } from '@/components/spots/spot-gallery';
import { cn, isArabic } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Spot } from '@/types';

interface SpotCardProps {
    spot: Spot;
}

/**
 * A single bookable spot: its photo gallery, name, short copy and price, with
 * the reserve action underneath. A spot already taken keeps its card but trades
 * the action for a "reserved" notice.
 */
function SpotCardComponent({ spot }: SpotCardProps) {
    const { whatsappBadge, whatsappNumber } = usePage().props;

    // Reservations are handled over chat: prefer the general contact number and
    // fall back to the ordering one. With neither configured the card simply
    // shows its details, since there is nowhere to send the request.
    const contactNumber =
        (whatsappBadge?.show ? whatsappBadge.number : null) ?? whatsappNumber;

    // Right-align and flip the text block to RTL when the name is Arabic.
    const rtl = isArabic(spot.name);

    return (
        <div
            className={cn(
                'group relative flex h-full min-w-0 flex-col rounded-[1.5rem] border border-primary/15 bg-card/60 p-3 transition-all duration-300',
                spot.is_reserved
                    ? 'opacity-75'
                    : 'hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_32px_-24px_rgba(120,137,108,0.9)]',
            )}
        >
            <div className="relative">
                <SpotGallery images={spot.images} name={spot.name} />

                {spot.is_reserved && (
                    <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-brick px-3 py-1 text-[10px] tracking-[0.16em] text-primary-foreground uppercase">
                        <Lock aria-hidden className="size-3" />
                        Reserved
                    </span>
                )}
            </div>

            <div className="mt-3 flex min-w-0 flex-1 flex-col">
                <h2
                    dir={rtl ? 'rtl' : undefined}
                    className={cn(
                        'min-w-0 font-heading text-xl leading-tight font-semibold text-primary',
                        rtl && 'text-right',
                    )}
                >
                    {spot.name}
                </h2>

                {spot.description && (
                    <p
                        dir={rtl ? 'rtl' : undefined}
                        className={cn(
                            'mt-1 line-clamp-3 text-xs text-muted-foreground/80',
                            rtl && 'text-right',
                        )}
                    >
                        {spot.description}
                    </p>
                )}

                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <ProductPrice
                        basePrice={spot.price}
                        discountPrice={spot.discount_price}
                    />

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
                                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <CalendarCheck aria-hidden className="size-4" />
                                Reserve
                            </a>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memoized to match the menu's product cards, so a re-render of the page shell
 * doesn't rebuild every gallery in the grid.
 */
export const SpotCard = memo(SpotCardComponent);
