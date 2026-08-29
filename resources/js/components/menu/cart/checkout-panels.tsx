import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    MapPin,
    MapPinOff,
    Send,
} from 'lucide-react';
import { phoneDigitCount } from '@/hooks/use-checkout';
import { cn } from '@/lib/utils';
import type { TableSpot } from '@/types';

/** The filled action that advances the flow. */
const primaryAction =
    'inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

/** The quiet action that steps back or offers an alternative. */
const ghostAction =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 px-5 py-3 text-sm tracking-wide text-primary uppercase transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

const field =
    'w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

interface DetailsStepProps {
    requireFullName: boolean;
    requirePhoneNumber: boolean;
    /** The line above the fields, which differs between the two carts. */
    hint: string;
    /** The label on the button that steps back to the item list. */
    backLabel: string;
    name: string;
    onNameChange: (value: string) => void;
    phone: string;
    onPhoneChange: (value: string) => void;
    valid: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

/** Collects the name and/or phone number the shop asks for. */
export function DetailsStep({
    requireFullName,
    requirePhoneNumber,
    hint,
    backLabel,
    name,
    onNameChange,
    phone,
    onPhoneChange,
    valid,
    onBack,
    onConfirm,
}: DetailsStepProps) {
    // Only warn once something has been typed, so the field doesn't open in an
    // error state.
    const phoneTooShort =
        requirePhoneNumber && phone.trim() !== '' && phoneDigitCount(phone) < 8;

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onConfirm();
            }}
            className="flex flex-col gap-4 p-5"
        >
            <p className="text-sm text-muted-foreground">{hint}</p>

            {requireFullName && (
                <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                        Full name
                    </span>
                    <input
                        autoFocus
                        value={name}
                        onChange={(event) => onNameChange(event.target.value)}
                        placeholder="Your name"
                        className={field}
                    />
                </label>
            )}

            {requirePhoneNumber && (
                <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                        Phone number
                    </span>
                    <input
                        type="tel"
                        inputMode="tel"
                        autoFocus={!requireFullName}
                        value={phone}
                        onChange={(event) => onPhoneChange(event.target.value)}
                        placeholder="e.g. 70 123 456"
                        className={cn(
                            field,
                            phoneTooShort && 'border-destructive/50',
                        )}
                    />
                    {phoneTooShort && (
                        <span className="text-xs text-destructive">
                            That looks too short — please enter a full number.
                        </span>
                    )}
                </label>
            )}

            <div className="flex flex-col gap-2">
                <button
                    type="submit"
                    disabled={!valid}
                    className={primaryAction}
                >
                    Continue
                    <ArrowRight className="size-4" />
                </button>
                <button type="button" onClick={onBack} className={ghostAction}>
                    <ArrowLeft className="size-4" />
                    {backLabel}
                </button>
            </div>
        </form>
    );
}

interface SpotStepProps {
    spots: TableSpot[];
    spotId: number | null;
    onSpotChange: (value: number) => void;
    valid: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

/**
 * Where the customer is sitting, as a list of radios rather than a dropdown:
 * every spot is a name the customer has to recognise from the place around
 * them, and a list shows them all at once instead of one at a time.
 */
export function SpotStep({
    spots,
    spotId,
    onSpotChange,
    valid,
    onBack,
    onConfirm,
}: SpotStepProps) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onConfirm();
            }}
            className="flex min-h-0 flex-1 flex-col"
        >
            <p className="shrink-0 px-5 pt-5 text-sm text-muted-foreground">
                Pick the spot you&rsquo;re sitting at, so we bring your order to
                the right place.
            </p>

            <div
                role="radiogroup"
                aria-label="Your spot"
                className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-5"
            >
                {spots.map((spot) => {
                    const selected = spot.id === spotId;

                    return (
                        <label
                            key={spot.id}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors',
                                selected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10',
                                // The ring follows the input's focus, since the
                                // input itself is visually hidden.
                                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                            )}
                        >
                            <input
                                type="radio"
                                name="spot"
                                value={spot.id}
                                checked={selected}
                                onChange={() => onSpotChange(spot.id)}
                                className="sr-only"
                            />

                            <span
                                aria-hidden
                                className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                    selected
                                        ? 'border-primary'
                                        : 'border-primary/35',
                                )}
                            >
                                {selected && (
                                    <span className="size-2.5 rounded-full bg-primary" />
                                )}
                            </span>

                            <span
                                className={cn(
                                    'min-w-0 flex-1 truncate text-sm',
                                    selected
                                        ? 'text-primary'
                                        : 'text-foreground/80',
                                )}
                            >
                                {spot.name}
                            </span>
                        </label>
                    );
                })}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-primary/15 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <button
                    type="submit"
                    disabled={!valid}
                    className={primaryAction}
                >
                    Continue
                    <ArrowRight className="size-4" />
                </button>
                <button type="button" onClick={onBack} className={ghostAction}>
                    <ArrowLeft className="size-4" />
                    Back
                </button>
            </div>
        </form>
    );
}

interface NoteStepProps {
    note: string;
    onNoteChange: (value: string) => void;
    onBack: () => void;
    onConfirm: () => void;
}

/** The last stop before sending: an optional note for the whole order. */
export function NoteStep({
    note,
    onNoteChange,
    onBack,
    onConfirm,
}: NoteStepProps) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onConfirm();
            }}
            className="flex flex-col gap-4 p-5"
        >
            <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground/80">
                    Anything we should know?
                </p>
                <p className="text-xs text-muted-foreground">
                    Optional — directions, allergies, or anything else.
                </p>
            </div>

            <textarea
                autoFocus
                rows={4}
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="e.g. ring the top bell, no cutlery please"
                className={cn(field, 'resize-none')}
            />

            <div className="flex flex-col gap-2">
                <button type="submit" className={primaryAction}>
                    <Send className="size-4" />
                    Send order on WhatsApp
                </button>
                <button type="button" onClick={onBack} className={ghostAction}>
                    <ArrowLeft className="size-4" />
                    Back
                </button>
            </div>
        </form>
    );
}

/** Shown while the browser is resolving the customer's position. */
export function LocatingStep() {
    return (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="relative flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="size-5 text-primary" />
                <Loader2 className="absolute size-12 animate-spin text-primary/30" />
            </span>
            <p className="text-sm text-foreground/80">Finding your location…</p>
            <p className="text-xs text-muted-foreground">
                Allow location access so we know where to deliver. This takes a
                few seconds.
            </p>
        </div>
    );
}

interface LocationErrorStepProps {
    /** True when access was explicitly blocked rather than simply unavailable. */
    denied: boolean;
    onRetry: () => void;
    onSendWithout: () => void;
}

/**
 * Shown when a location couldn't be captured. The order is held here rather
 * than sent with a bad pin — the customer can retry or share it in the chat.
 */
export function LocationErrorStep({
    denied,
    onRetry,
    onSendWithout,
}: LocationErrorStepProps) {
    return (
        <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
                <MapPinOff className="size-6 text-primary" />
                <p className="text-sm text-foreground/80">
                    {denied
                        ? "We couldn't get your location because access is blocked."
                        : "We couldn't pin down your location."}
                </p>
                <p className="text-xs text-muted-foreground">
                    {denied
                        ? 'Allow location for this site in your browser settings, then try again — or send your order and drop a pin in the chat.'
                        : 'Try again somewhere with a clearer signal, or send your order and drop a pin in the chat.'}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onRetry}
                    className={primaryAction}
                >
                    <MapPin className="size-4" />
                    Try again
                </button>
                <button
                    type="button"
                    onClick={onSendWithout}
                    className={ghostAction}
                >
                    <Send className="size-4" />
                    Send and share my pin in the chat
                </button>
            </div>
        </div>
    );
}

interface SendingStepProps {
    /** The built link, offered as a manual fallback. */
    whatsappUrl: string | null;
}

/** The hand-off confirmation, with a manual link if the redirect doesn't fire. */
export function SendingStep({ whatsappUrl }: SendingStepProps) {
    return (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Send className="size-5 animate-pulse text-primary" />
            </span>
            <p className="text-sm text-foreground/80">Opening WhatsApp…</p>
            <p className="text-xs text-muted-foreground">
                If it didn't open, use the button below to send your order.
            </p>

            {whatsappUrl && (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(primaryAction, 'mt-1')}
                >
                    <Send className="size-4" />
                    Open WhatsApp
                </a>
            )}
        </div>
    );
}
