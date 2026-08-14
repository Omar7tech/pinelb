import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bike,
    CalendarCheck,
    MapPin,
    Phone,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import { ContactDialog } from '@/components/contact-dialog';
import { LocationDialog } from '@/components/location-dialog';
import { PineLogo } from '@/components/pine-logo';
import { Treeline } from '@/components/treeline';
import { Button } from '@/components/ui/button';
import { nextOpeningLabel, useShop, useShopOpen } from '@/lib/shop';
import { cn } from '@/lib/utils';

/**
 * Landing call-to-action. Sage by default; on hover a cream panel wipes up from
 * the baseline, the label inverts to sage, and the icon rolls over to a fresh
 * copy of itself.
 *
 * `outline` draws the same shape the other way round — sage on cream, wiping to
 * sage on hover — for the calls that sit beside the main one.
 *
 * Passing `href` turns the button into an Inertia link, or a plain one opening
 * in a new tab when `external` is set; `disabled` keeps the shape but drops the
 * navigation (used when delivery is switched off).
 */
function HeroButton({
    icon: Icon,
    label,
    href,
    onClick,
    external = false,
    outline = false,
    disabled = false,
    title,
    className,
}: {
    icon: LucideIcon;
    label: string;
    href?: string;
    /** Acts in place instead of navigating — used to open the map dialog. */
    onClick?: () => void;
    external?: boolean;
    outline?: boolean;
    disabled?: boolean;
    title?: string;
    className?: string;
}) {
    const interactive = href !== undefined && !disabled;
    // The wipe carries the colour the label ends up on, so it is the inverse of
    // whichever way round the button is drawn.
    const body = (
        <HeroButtonBody
            icon={Icon}
            label={label}
            wipeClassName={outline ? 'bg-primary' : 'bg-background'}
        />
    );

    return (
        <Button
            asChild={interactive}
            size="lg"
            onClick={onClick}
            // `disabled` is only a valid attribute on the plain button shape;
            // when the button renders as a link it must not be forwarded.
            disabled={interactive ? undefined : disabled}
            title={title}
            className={cn(
                'relative isolate h-13 w-full gap-3 overflow-hidden rounded-full border border-primary px-8 text-base transition-colors duration-300 ease-out sm:h-12 sm:w-auto sm:px-9',
                outline
                    ? 'bg-transparent text-primary hover:bg-transparent hover:text-primary-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary',
                className,
            )}
        >
            {interactive ? (
                external ? (
                    // A map link leaves the site and so opens in a new tab; a
                    // `tel:` hands off to the phone and must stay in place.
                    <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                        {body}
                    </a>
                ) : (
                    <Link href={href}>{body}</Link>
                )
            ) : (
                body
            )}
        </Button>
    );
}

/** The wipe panel, rolling icon and label shared by both button shapes. */
function HeroButtonBody({
    icon: Icon,
    label,
    wipeClassName,
}: {
    icon: LucideIcon;
    label: string;
    wipeClassName: string;
}) {
    return (
        <>
            <span
                aria-hidden
                className={cn(
                    'absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/button:scale-y-100 motion-reduce:transition-none',
                    wipeClassName,
                )}
            />
            <span className="relative flex size-5 items-center justify-center overflow-hidden">
                <Icon className="size-5 transition-transform duration-300 ease-out group-hover/button:-translate-y-6 motion-reduce:transform-none" />
                <Icon
                    aria-hidden
                    className="absolute size-5 translate-y-6 transition-transform duration-300 ease-out group-hover/button:translate-y-0 motion-reduce:hidden"
                />
            </span>
            {label}
        </>
    );
}

export default function Welcome() {
    const { location, onlineOrderingActive, reservations, whatsappBadge } =
        usePage().props;
    const shop = useShop();
    const shopOpen = useShopOpen();
    const opensLabel = nextOpeningLabel(shop);
    const [mapOpen, setMapOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    // The chat number, which is what turns a call into a choice of two.
    const whatsappNumber = whatsappBadge.show ? whatsappBadge.number : null;
    // Either half of the location is enough to offer the button: an embedded
    // map opens in place, and a link opens the map app.
    const findUs = location.mapIframeUrl ?? location.mapUrl;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-svh flex-col">
                <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
                    <PineLogo className="w-full max-w-xs select-none sm:max-w-sm" />
                    <div className="flex w-full max-w-xs animate-in flex-col items-stretch gap-4 delay-800 duration-450 ease-out fill-mode-backwards fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:max-w-md">
                        <section
                            aria-labelledby="menu-heading"
                            className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-4 sm:p-5"
                        >
                            <h2
                                id="menu-heading"
                                className="text-center font-heading text-4xl font-semibold tracking-normal text-primary uppercase sm:text-4xl"
                            >
                                Menu
                            </h2>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-3">
                                <HeroButton
                                    icon={UtensilsCrossed}
                                    label="Dine in"
                                    href="/menu/dine-in"
                                    className="sm:flex-1 sm:px-6"
                                />
                                <HeroButton
                                    icon={Bike}
                                    label="Delivery"
                                    href="/menu/delivery"
                                    disabled={!onlineOrderingActive}
                                    title={
                                        onlineOrderingActive
                                            ? undefined
                                            : 'Delivery is currently unavailable'
                                    }
                                    className="sm:flex-1 sm:px-6"
                                />
                            </div>

                            {!shopOpen && (
                                <p className="mt-4 text-center text-[11px] tracking-[0.16em] text-primary/60 uppercase">
                                    We&rsquo;re closed right now
                                    {opensLabel && (
                                        <span className="block tracking-normal normal-case">
                                            {opensLabel}
                                        </span>
                                    )}
                                </p>
                            )}
                        </section>
                        <div className="flex flex-col gap-3">
                            <HeroButton
                                icon={CalendarCheck}
                                label="حجوز قعدتك"
                                href="/spots"
                                disabled={!reservations.active}
                                title={
                                    reservations.active
                                        ? undefined
                                        : 'Reservations are currently unavailable'
                                }
                                className="border-brick bg-brick hover:bg-brick hover:text-brick sm:w-full"
                            />

                            {/* The two ways to reach us keep a line of their
                                own under the reservation, sharing its width. */}
                            <div className="flex justify-center gap-3">
                                {/* With a map to embed, the button opens it
                                    here and the dialog carries the way out to
                                    a full map; without one it is that way out
                                    itself. */}
                                {findUs && (
                                    <HeroButton
                                        icon={MapPin}
                                        label="Find us"
                                        href={
                                            location.mapIframeUrl
                                                ? undefined
                                                : (location.mapUrl ?? undefined)
                                        }
                                        onClick={
                                            location.mapIframeUrl
                                                ? () => setMapOpen(true)
                                                : undefined
                                        }
                                        external
                                        outline
                                        title="See where we are"
                                        className="flex-1 px-4 sm:w-auto sm:px-6"
                                    />
                                )}

                                {/* With WhatsApp on offer the button opens the
                                    choice between it and a call; on its own,
                                    the phone number simply dials. */}
                                {location.phoneNumber && (
                                    <HeroButton
                                        icon={Phone}
                                        label="Call"
                                        href={
                                            whatsappNumber
                                                ? undefined
                                                : `tel:${location.phoneNumber}`
                                        }
                                        onClick={
                                            whatsappNumber
                                                ? () => setContactOpen(true)
                                                : undefined
                                        }
                                        external
                                        outline
                                        title={
                                            whatsappNumber
                                                ? 'Message or call us'
                                                : `Call ${location.phoneNumber}`
                                        }
                                        className="flex-1 px-4 sm:w-auto sm:px-6"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Treeline className="animate-in delay-1000 duration-600 ease-out fill-mode-backwards fade-in slide-in-from-bottom-6 motion-reduce:animate-none" />
            </div>

            {location.mapIframeUrl && (
                <LocationDialog
                    open={mapOpen}
                    onOpenChange={setMapOpen}
                    iframeUrl={location.mapIframeUrl}
                    mapUrl={location.mapUrl}
                />
            )}

            {location.phoneNumber && whatsappNumber && (
                <ContactDialog
                    open={contactOpen}
                    onOpenChange={setContactOpen}
                    phoneNumber={location.phoneNumber}
                    whatsappNumber={whatsappNumber}
                />
            )}
        </>
    );
}
