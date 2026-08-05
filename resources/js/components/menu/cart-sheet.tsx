import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartLine } from '@/components/menu/cart/cart-line';
import { CartTotals } from '@/components/menu/cart/cart-totals';
import {
    DetailsStep,
    LocatingStep,
    LocationErrorStep,
    NoteStep,
    SendingStep,
} from '@/components/menu/cart/checkout-panels';
import { NoteEditorDialog } from '@/components/menu/cart/note-editor-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/hooks/use-checkout';
import { usePricing } from '@/hooks/use-pricing';

/** The heading shown for each step of the flow. */
const STEP_TITLES = {
    cart: 'Your order',
    details: 'Your details',
    note: 'Add a note',
    locating: 'Your location',
    'location-error': 'Your location',
    sending: 'Sending',
} as const;

/**
 * The cart and checkout, as a bottom sheet on mobile and a centered modal on
 * desktop. Walks from the item list through whichever details the shop asks for
 * and hands the finished order off to WhatsApp.
 */
export function CartSheet() {
    const {
        items,
        open,
        setOpen,
        count,
        subtotalUsd,
        increment,
        decrement,
        removeItem,
        setNote,
        clear,
    } = useCart();
    const pricing = usePricing();

    // Delivery is only charged when there is something to deliver.
    const deliveryFeeUsd = items.length > 0 ? pricing.deliveryFeeUsd : null;
    const totalUsd = subtotalUsd + (deliveryFeeUsd ?? 0);

    const checkout = useCheckout({
        items,
        pricing,
        subtotalUsd,
        deliveryFeeUsd,
        totalUsd,
    });

    const [confirmingClear, setConfirmingClear] = useState(false);
    // The line whose note is being edited, if any.
    const [noteEditingKey, setNoteEditingKey] = useState<string | null>(null);
    const noteEditingItem =
        items.find((item) => item.key === noteEditingKey) ?? null;

    // Let the destructive confirmation lapse rather than leaving it armed.
    useEffect(() => {
        if (!confirmingClear) {
            return;
        }

        const timeout = window.setTimeout(
            () => setConfirmingClear(false),
            4000,
        );

        return () => window.clearTimeout(timeout);
    }, [confirmingClear]);

    const handleOpenChange = (next: boolean): void => {
        setOpen(next);

        if (!next) {
            setConfirmingClear(false);
            setNoteEditingKey(null);
            checkout.reset();
        }
    };

    const handleClear = (): void => {
        clear();
        checkout.setOrderNote('');
        setConfirmingClear(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="flex h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[88vh]">
                    <DialogHeader className="shrink-0 border-b border-primary/15 p-5 pr-14">
                        <DialogTitle className="flex items-center gap-2.5">
                            {STEP_TITLES[checkout.step]}
                            {checkout.step === 'cart' && count > 0 && (
                                <span className="rounded-full bg-primary px-2.5 py-1 font-sans text-xs font-medium text-primary-foreground">
                                    {count}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {checkout.step === 'details' && (
                        <DetailsStep
                            requireFullName={checkout.requireFullName}
                            requirePhoneNumber={checkout.requirePhoneNumber}
                            name={checkout.name}
                            onNameChange={checkout.setName}
                            phone={checkout.phone}
                            onPhoneChange={checkout.setPhone}
                            valid={checkout.detailsValid}
                            onBack={checkout.backToCart}
                            onConfirm={checkout.confirmDetails}
                        />
                    )}

                    {checkout.step === 'note' && (
                        <NoteStep
                            note={checkout.orderNote}
                            onNoteChange={checkout.setOrderNote}
                            onBack={checkout.noteBack}
                            onConfirm={checkout.confirmNote}
                        />
                    )}

                    {checkout.step === 'locating' && <LocatingStep />}

                    {checkout.step === 'location-error' && (
                        <LocationErrorStep
                            denied={checkout.locationDenied}
                            onRetry={checkout.retryLocation}
                            onSendWithout={checkout.sendWithoutLocation}
                        />
                    )}

                    {checkout.step === 'sending' && (
                        <SendingStep whatsappUrl={checkout.whatsappUrl} />
                    )}

                    {checkout.step === 'cart' &&
                        (items.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-14 text-center">
                                <ShoppingBag className="size-9 text-primary/25" />
                                <p className="text-sm text-foreground/80">
                                    Your order is empty
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Add a few things from the menu to get
                                    started.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    Browse the menu
                                </button>
                            </div>
                        ) : (
                            <>
                                <ul className="flex min-h-0 flex-1 flex-col divide-y divide-primary/10 overflow-y-auto">
                                    {items.map((item) => (
                                        <CartLine
                                            key={item.key}
                                            item={item}
                                            pricing={pricing}
                                            onIncrement={() =>
                                                increment(item.key)
                                            }
                                            onDecrement={() =>
                                                decrement(item.key)
                                            }
                                            onRemove={() =>
                                                removeItem(item.key)
                                            }
                                            onEditNote={() =>
                                                setNoteEditingKey(item.key)
                                            }
                                        />
                                    ))}
                                </ul>

                                <div className="flex shrink-0 flex-col gap-3 border-t border-primary/15 bg-primary/5 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                                    <CartTotals
                                        pricing={pricing}
                                        subtotalUsd={subtotalUsd}
                                        deliveryFeeUsd={deliveryFeeUsd}
                                        totalUsd={totalUsd}
                                    />

                                    <button
                                        type="button"
                                        onClick={checkout.startCheckout}
                                        disabled={!checkout.canSend}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Checkout
                                        <ArrowRight className="size-4" />
                                    </button>

                                    {!checkout.canSend && (
                                        <p className="text-center text-xs text-muted-foreground">
                                            Ordering is unavailable right now.
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={
                                            confirmingClear
                                                ? handleClear
                                                : () => setConfirmingClear(true)
                                        }
                                        className="inline-flex items-center justify-center gap-1.5 self-center text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <Trash2 className="size-3.5" />
                                        {confirmingClear
                                            ? 'Tap again to empty'
                                            : 'Empty the cart'}
                                    </button>
                                </div>
                            </>
                        ))}
                </DialogContent>
            </Dialog>

            {noteEditingItem && (
                <NoteEditorDialog
                    // Remount per line so the draft starts from that line's note.
                    key={noteEditingItem.key}
                    title={noteEditingItem.title}
                    initialNote={noteEditingItem.note ?? ''}
                    onClose={() => setNoteEditingKey(null)}
                    onSave={(note) => {
                        setNote(noteEditingItem.key, note);
                        setNoteEditingKey(null);
                    }}
                />
            )}
        </>
    );
}
