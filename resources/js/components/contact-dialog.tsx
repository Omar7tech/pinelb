import { Phone } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The number to call, and the one shown. */
    phoneNumber: string;
    /** The WhatsApp number — the reason this dialog exists rather than a dial. */
    whatsappNumber: string;
}

/**
 * The two ways to reach the shop, offered side by side once WhatsApp is one of
 * them: the number itself, then WhatsApp and a plain call under it. With no
 * WhatsApp number configured there is nothing to choose between, and the button
 * that opens this dials instead.
 */
export function ContactDialog({
    open,
    onOpenChange,
    phoneNumber,
    whatsappNumber,
}: ContactDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="pr-8">Get in touch</DialogTitle>
                    <DialogDescription>
                        Message us on WhatsApp, or give us a ring.
                    </DialogDescription>
                </DialogHeader>

                {/* The number leads: it is what someone came here for, and it
                    is dialable in its own right. */}
                <a
                    href={`tel:${phoneNumber}`}
                    dir="ltr"
                    className="block rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center font-heading text-2xl tracking-wide text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    {phoneNumber}
                </a>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                        href={buildWhatsAppUrl(
                            whatsappNumber,
                            'Hi! I have a question about Pine.',
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <img
                            src="/social-icons/whatsapp.svg"
                            alt=""
                            draggable={false}
                            className="size-5 select-none"
                        />
                        WhatsApp
                    </a>

                    <a
                        href={`tel:${phoneNumber}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-primary px-5 py-3 text-sm tracking-wide text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <Phone aria-hidden className="size-4" />
                        Call
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}
