import { Head } from '@inertiajs/react';
import { CalendarCheck, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-svh flex-col items-center justify-center gap-10 px-6">
                <img
                    src="/logos/pine-logo-horizontal.svg"
                    alt="Pine"
                    className="w-full max-w-sm"
                />
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="h-11 px-8 text-base">
                        <UtensilsCrossed className="size-5" />
                        Menu
                    </Button>
                    <Button size="lg" className="h-11 px-8 text-base">
                        <CalendarCheck className="size-5" />
                        Reserve your spot
                    </Button>
                </div>
            </div>
        </>
    );
}
