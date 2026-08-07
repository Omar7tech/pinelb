import { Clock } from 'lucide-react';
import { nextOpeningLabel, useShop, useShopOpen } from '@/lib/shop';

/**
 * The strip under the header telling customers the shop is closed, with the
 * next opening time when it runs on the automatic schedule. Renders nothing
 * while the shop is open.
 */
export function ShopClosedNotice() {
    const shop = useShop();
    const open = useShopOpen();

    if (open) {
        return null;
    }

    const opensLabel = nextOpeningLabel(shop);

    return (
        <div className="border-b border-primary/10 bg-primary/5">
            <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center text-xs tracking-[0.14em] text-primary uppercase md:px-10">
                <Clock aria-hidden className="size-3.5 shrink-0" />
                We&rsquo;re closed right now
                {opensLabel && (
                    <span className="text-primary/60 normal-case">
                        {opensLabel}
                    </span>
                )}
            </p>
        </div>
    );
}
