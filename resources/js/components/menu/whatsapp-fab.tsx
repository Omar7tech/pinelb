import { usePage } from '@inertiajs/react';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

/**
 * Floating WhatsApp button pinned to the bottom-right corner. Opens a small
 * dialog where the customer types a message, then hands off to WhatsApp with
 * it pre-filled. Controlled by the WhatsApp button settings.
 */
export function WhatsAppFab() {
    const { whatsappBadge } = usePage().props;
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    if (!whatsappBadge?.show || !whatsappBadge.number) {
        return null;
    }

    const number = whatsappBadge.number;

    const handleSend = (): void => {
        const trimmed = message.trim();

        if (trimmed === '') {
            return;
        }

        window.open(
            buildWhatsAppUrl(number, trimmed),
            '_blank',
            'noopener,noreferrer',
        );

        setOpen(false);
        setMessage('');
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Chat on WhatsApp"
                className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_30px_-12px_rgba(120,137,108,0.9)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none md:right-6 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:size-16"
            >
                <MessageCircle className="size-6 md:size-7" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chat with us</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Send us a message on WhatsApp and we'll get back to
                            you.
                        </p>
                    </DialogHeader>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSend();
                        }}
                        className="flex flex-col gap-3"
                    >
                        <textarea
                            autoFocus
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            rows={4}
                            placeholder="Type your message…"
                            className="w-full resize-none rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        />

                        <button
                            type="submit"
                            disabled={message.trim() === ''}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send className="size-4" />
                            Send on WhatsApp
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
