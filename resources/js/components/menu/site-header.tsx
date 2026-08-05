import { Link } from '@inertiajs/react';
import { PineLogo } from '@/components/pine-logo';

/**
 * Top bar for the menu pages: the wordmark, linked back to the landing page.
 */
export function SiteHeader() {
    return (
        <header className="border-b border-primary/10">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-5 md:px-10">
                <Link
                    href="/"
                    aria-label="Pine home"
                    className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <PineLogo className="h-14 w-auto select-none md:h-16" />
                </Link>
            </div>
        </header>
    );
}
