import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Bike, CalendarCheck, UtensilsCrossed } from 'lucide-react';
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
 * Passing `href` turns the button into an Inertia link; `disabled` keeps the
 * shape but drops the navigation (used when delivery is switched off).
 */
function HeroButton({
    icon: Icon,
    label,
    href,
    disabled = false,
    title,
    className,
}: {
    icon: LucideIcon;
    label: string;
    href?: string;
    disabled?: boolean;
    title?: string;
    className?: string;
}) {
    const interactive = href !== undefined && !disabled;

    return (
        <Button
            asChild={interactive}
            size="lg"
            // `disabled` is only a valid attribute on the plain button shape;
            // when the button renders as a link it must not be forwarded.
            disabled={interactive ? undefined : disabled}
            title={title}
            className={cn(
                'relative isolate h-13 w-full gap-3 overflow-hidden rounded-full border-primary bg-primary px-8 text-base text-primary-foreground transition-colors duration-300 ease-out hover:bg-primary hover:text-primary sm:h-12 sm:w-auto sm:px-9',
                className,
            )}
        >
            {interactive ? (
                <Link href={href}>
                    <HeroButtonBody icon={Icon} label={label} />
                </Link>
            ) : (
                <HeroButtonBody icon={Icon} label={label} />
            )}
        </Button>
    );
}

/** The wipe panel, rolling icon and label shared by both button shapes. */
function HeroButtonBody({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <>
            <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-background transition-transform duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/button:scale-y-100 motion-reduce:transition-none"
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
    const { onlineOrderingActive, reservations } = usePage().props;
    const shop = useShop();
    const shopOpen = useShopOpen();
    const opensLabel = nextOpeningLabel(shop);

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
                            className="self-center border-brick bg-brick hover:bg-brick hover:text-brick sm:w-auto"
                        />
                    </div>
                </div>
                <Treeline className="animate-in delay-1000 duration-600 ease-out fill-mode-backwards fade-in slide-in-from-bottom-6 motion-reduce:animate-none" />
            </div>
        </>
    );
}
