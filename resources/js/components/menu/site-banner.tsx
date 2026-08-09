import { usePage } from '@inertiajs/react';

/**
 * Promotional strip above the header, driven by the shared `banner` setting.
 * Renders nothing when the banner is disabled or empty.
 */
export function SiteBanner() {
    const { banner } = usePage().props;

    if (!banner?.show || !banner.text) {
        return null;
    }

    return (
        <div className="bg-brick text-cream">
            <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs tracking-[0.18em] uppercase md:px-10 md:text-sm">
                {banner.text}
            </p>
        </div>
    );
}
