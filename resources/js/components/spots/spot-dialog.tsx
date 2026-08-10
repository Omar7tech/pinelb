import { CalendarCheck, Lock } from 'lucide-react';
import { ProductPrice } from '@/components/menu/product-price';
import { SpotGallery } from '@/components/spots/spot-gallery';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn, isArabic } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { Spot } from '@/types';

interface SpotDialogProps {
    spot: Spot;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Where reservation requests are sent; null hides the reserve action. */
    contactNumber: string | null;
}

/**
 * Full spot details in a responsive dialog: the swipeable photo gallery, the
 * complete description the card only teases, and the price with the reserve
 * action pinned underneath.
 */
export function SpotDialog({
    spot,
    open,
    onOpenChange,
    contactNumber,
}: SpotDialogProps) {
    // Right-align and flip the text block to RTL when the name is Arabic.
    const rtl = isArabic(spot.name);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* The panel itself doesn't scroll: the gallery and price footer stay
                put and only the middle column scrolls. */}
            <DialogContent className="gap-0 overflow-y-hidden p-0">
                <div className="relative shrink-0 p-4 pt-2 sm:pt-4">
                    <SpotGallery
                        images={spot.images}
                        name={spot.name}
                        className="border border-primary/15"
                    />

                    {spot.is_reserved && (
                        <span className="absolute top-4 left-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-brick px-3 py-1 text-[10px] tracking-[0.16em] text-primary-foreground uppercase sm:top-6">
                            <Lock aria-hidden className="size-3" />
                            Reserved
                        </span>
                    )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
                    <DialogHeader className="shrink-0">
                        <DialogTitle
                            dir={rtl ? 'rtl' : undefined}
                            className={cn('pr-8', rtl && 'text-right')}
                        >
                            {spot.name}
                        </DialogTitle>
                    </DialogHeader>

                    {spot.description && (
                        <p
                            dir={rtl ? 'rtl' : undefined}
                            className={cn(
                                'text-sm leading-relaxed text-muted-foreground',
                                rtl && 'text-right',
                            )}
                        >
                            {spot.description}
                        </p>
                    )}
                </div>

                {/* Fixed footer: the price and action stay visible however long
                    the copy runs. */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-primary/15 bg-primary/5 px-5 py-4">
                    <ProductPrice
                        basePrice={spot.price}
                        discountPrice={spot.discount_price}
                        size="lg"
                    />

                    {spot.is_reserved ? (
                        <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
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
                                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <CalendarCheck aria-hidden className="size-4" />
                                Reserve
                            </a>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
