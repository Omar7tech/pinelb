import { Link } from '@inertiajs/react';
import { CartButton } from '@/components/menu/cart-button';
import { PineLogo } from '@/components/pine-logo';

interface SiteHeaderProps {
    /** Show the cart trigger (the delivery menu only). */
    showCart?: boolean;
}

/**
 * Top bar for the menu pages: the wordmark linked back to the landing page,
 * with the cart trigger on the right when ordering is available.
 */
export function SiteHeader({ showCart = false }: SiteHeaderProps) {
    return (
        <header className="border-b border-primary/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 md:px-10">
                {/* A matching spacer keeps the wordmark optically centred. */}
                <span aria-hidden className="w-11 shrink-0" />

                <Link
                    href="/"
                    aria-label="Pine home"
                    className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <PineLogo className="h-14 w-auto select-none md:h-16" />
                </Link>

                <span className="flex w-11 shrink-0 justify-end">
                    {showCart && <CartButton />}
                </span>
            </div>
        </header>
    );
}
