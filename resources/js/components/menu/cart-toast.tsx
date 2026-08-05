import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';

/**
 * Transient "added" confirmation. Opening the whole cart on every add would
 * interrupt someone building a larger order, so we confirm with a small toast
 * and let them open the cart when they're ready.
 */
export function CartToast() {
    const { lastAdded, setOpen, count } = useCart();
    // Which add has been dismissed (by timeout or "View"). The toast shows while
    // the latest add hasn't been dismissed — deriving visibility this way keeps
    // the effect free of synchronous setState.
    const [dismissedNonce, setDismissedNonce] = useState<number | null>(null);

    const visible = lastAdded !== null && lastAdded.nonce !== dismissedNonce;
    // `lastAdded` is never cleared, so the title stays put during the fade-out.
    const title = lastAdded?.title ?? '';

    // Schedule the auto-dismiss for each new add; the state update happens in
    // the timeout callback, not synchronously in the effect body.
    useEffect(() => {
        if (lastAdded === null) {
            return;
        }

        const { nonce } = lastAdded;
        const timeout = window.setTimeout(() => setDismissedNonce(nonce), 2600);

        return () => window.clearTimeout(timeout);
    }, [lastAdded]);

    const handleView = (): void => {
        if (lastAdded !== null) {
            setDismissedNonce(lastAdded.nonce);
        }

        setOpen(true);
    };

    return (
        <div
            aria-live="polite"
            className={cn(
                'pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 transition-all duration-300 sm:bottom-6',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2.5 rounded-full border border-primary/20 bg-background py-2 pr-2 pl-3 shadow-[0_16px_36px_-18px_rgba(120,137,108,0.9)]',
                    visible && 'pointer-events-auto',
                )}
            >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                </span>
                <span className="max-w-[42vw] truncate text-sm text-foreground/80 sm:max-w-xs">
                    Added {title}
                </span>
                <button
                    type="button"
                    onClick={handleView}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <ShoppingBag className="size-3.5" />
                    View
                    {count > 0 && (
                        <span className="tabular-nums">
                            ({count > 99 ? '99+' : count})
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
