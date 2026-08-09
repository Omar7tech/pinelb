import { Head } from '@inertiajs/react';
import { ShopClosedNotice } from '@/components/menu/shop-closed-notice';
import { SiteBanner } from '@/components/menu/site-banner';
import { SiteFooter } from '@/components/menu/site-footer';
import { SiteHeader } from '@/components/menu/site-header';
import { WhatsAppFab } from '@/components/menu/whatsapp-fab';
import { SpotCard } from '@/components/spots/spot-card';
import type { Spot } from '@/types';

interface SpotsProps {
    spots: Spot[];
}

/**
 * The reservation page behind the landing page's "احجز قعدتك" button: every
 * bookable spot as a card, the taken ones marked rather than hidden.
 */
export default function Spots({ spots }: SpotsProps) {
    return (
        <>
            <Head title="Reserve a spot" />

            <div className="flex min-h-svh flex-col">
                <SiteBanner />
                <SiteHeader />
                <ShopClosedNotice />

                <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-10">
                    <header className="border-b border-primary/15 pb-4">
                        <h1
                            dir="rtl"
                            className="text-right font-sans text-3xl leading-tight font-semibold tracking-normal text-primary md:text-4xl"
                        >
                            احجز قعدتك
                        </h1>
                    </header>

                    {spots.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {spots.map((spot) => (
                                <SpotCard key={spot.id} spot={spot} />
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-sm text-muted-foreground">
                            No spots available right now.
                        </p>
                    )}
                </main>

                <SiteFooter categories={[]} />
            </div>

            <WhatsAppFab />
        </>
    );
}
