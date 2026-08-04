import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { CalendarCheck, UtensilsCrossed } from 'lucide-react';
import { PineLogo } from '@/components/pine-logo';
import { Treeline } from '@/components/treeline';
import { Button } from '@/components/ui/button';

/**
 * Landing call-to-action. Sage by default; on hover a cream panel wipes up from
 * the baseline, the label inverts to sage, and the icon rolls over to a fresh
 * copy of itself.
 */
function HeroButton({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <Button
            size="lg"
            className="relative isolate h-12 gap-3 overflow-hidden border-primary bg-primary px-9 text-base text-primary-foreground transition-colors duration-300 ease-out hover:bg-primary hover:text-primary"
        >
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
        </Button>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-svh flex-col">
                <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
                    <PineLogo className="w-full max-w-sm select-none" />
                    <div className="flex animate-in flex-wrap items-center justify-center gap-4 delay-1500 duration-700 ease-out fill-mode-backwards fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
                        <HeroButton icon={UtensilsCrossed} label="Menu" />
                        <HeroButton
                            icon={CalendarCheck}
                            label="Reserve your spot"
                        />
                    </div>
                </div>
                <Treeline className="animate-in delay-1900 duration-1000 ease-out fill-mode-backwards fade-in slide-in-from-bottom-6 motion-reduce:animate-none" />
            </div>
        </>
    );
}
