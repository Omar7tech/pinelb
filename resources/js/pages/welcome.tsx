import { Head } from '@inertiajs/react';
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
                        Menu
                    </Button>
                    <Button size="lg" className="h-11 px-8 text-base">
                        Reserve your spot
                    </Button>
                </div>
            </div>
        </>
    );
}
