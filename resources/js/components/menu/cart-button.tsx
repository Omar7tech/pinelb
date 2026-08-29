import { ShoppingBag } from 'lucide-react';
import { useCart, useCartMode } from '@/contexts/cart-context';
import { CART_COPY } from '@/lib/cart-copy';

/** Header cart trigger with a live item-count badge. */
export function CartButton() {
    const { count, setOpen } = useCart();
    const mode = useCartMode();

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={CART_COPY[mode].trigger(count)}
            className="relative inline-flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <ShoppingBag className="size-5" />
            {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary-foreground ring-2 ring-background">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}
