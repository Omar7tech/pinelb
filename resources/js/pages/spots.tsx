import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ShopClosedNotice } from '@/components/menu/shop-closed-notice';
import { SiteBanner } from '@/components/menu/site-banner';
import { SiteFooter } from '@/components/menu/site-footer';
import { SiteHeader } from '@/components/menu/site-header';
import { WhatsAppFab } from '@/components/menu/whatsapp-fab';
import { SpotCard } from '@/components/spots/spot-card';
import type { SpotFilterValue } from '@/components/spots/spot-filter';
import { SpotFilter } from '@/components/spots/spot-filter';
import type { Spot } from '@/types';

interface SpotsProps {
    spots: Spot[];
}

/**
 * The reservation page behind the landing page's "احجز قعدتك" button: every
 * bookable spot as a card, the taken ones marked rather than hidden.
 */
export default function Spots({ spots }: SpotsProps) {
    const counts = useMemo(() => {
        const available = spots.filter((spot) => !spot.is_reserved).length;

        return { available, reserved: spots.length - available };
    }, [spots]);

    // Open on the free spots, since that's what people came for. On a fully
    // booked night there's nothing to show there, so start on the taken ones.
    const [filter, setFilter] = useState<SpotFilterValue>(
        counts.available > 0 ? 'available' : 'reserved',
    );

    // Filtering is client-side: the page ships every spot, so switching sides
    // costs nothing and needs no round trip.
    const visibleSpots = useMemo(
        () =>
            spots.filter((spot) =>
                filter === 'reserved' ? spot.is_reserved : !spot.is_reserved,
            ),
        [spots, filter],
    );

    return (
        <>
            <Head title="Reserve a spot" />

            <div className="flex min-h-svh flex-col">
                <SiteBanner />
                <SiteHeader />
                <ShopClosedNotice />

                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-10">
                    <header className="flex flex-col gap-4 border-b border-primary/15 pb-4">
                        <h1
                            dir="rtl"
                            className="text-right font-sans text-3xl leading-tight font-semibold tracking-normal text-primary md:text-4xl"
                        >
                            احجز قعدتك
                        </h1>

                        {spots.length > 0 && (
                            <>
                                <SpotFilter
                                    value={filter}
                                    onChange={setFilter}
                                    counts={counts}
                                />

                                {/* The counts sit on the switch itself; this
                                    spells the selection out for screen readers. */}
                                <p aria-live="polite" className="sr-only">
                                    Showing {visibleSpots.length} {filter}{' '}
                                    {visibleSpots.length === 1
                                        ? 'spot'
                                        : 'spots'}
                                    .
                                </p>
                            </>
                        )}
                    </header>

                    {visibleSpots.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {visibleSpots.map((spot) => (
                                <SpotCard key={spot.id} spot={spot} />
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-sm text-muted-foreground">
                            {spots.length === 0
                                ? 'No spots available right now.'
                                : filter === 'available'
                                  ? 'Every spot is taken right now.'
                                  : 'No reserved spots right now.'}
                        </p>
                    )}
                </main>

                <SiteFooter categories={[]} />
            </div>

            <WhatsAppFab />
        </>
    );
}
