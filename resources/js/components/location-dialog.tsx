import { ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface LocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The embedded map's address — the reason this dialog exists. */
    iframeUrl: string;
    /** The map link, kept as the way out to a proper map app. */
    mapUrl: string | null;
}

/**
 * The shop's location, shown in place: the embedded map with a way out to the
 * full one underneath, for anyone who wants directions rather than a look.
 */
export function LocationDialog({
    open,
    onOpenChange,
    iframeUrl,
    mapUrl,
}: LocationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0">
                <DialogHeader className="shrink-0 px-5 pt-5 pb-4">
                    <DialogTitle className="pr-8">Find us</DialogTitle>
                    <DialogDescription>
                        We&rsquo;re here — under the pines.
                    </DialogDescription>
                </DialogHeader>

                <iframe
                    src={iframeUrl}
                    title="Map of the shop"
                    // The map is heavy and below the fold of the page until the
                    // dialog opens, so it is left to load on its own terms.
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="block aspect-[4/3] w-full border-y border-primary/15 bg-primary/5 sm:aspect-video"
                />

                {mapUrl && (
                    <div className="shrink-0 bg-primary/5 px-5 py-4">
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            <ExternalLink aria-hidden className="size-4" />
                            Open in maps
                        </a>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
