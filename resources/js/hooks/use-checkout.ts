import { usePage } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import type { CartItem, CartMode } from '@/contexts/cart-context';
import type { PriceParts } from '@/hooks/use-pricing';
import { getBestLocation, isPermissionDenied } from '@/lib/geolocation';
import type { LocationResult } from '@/lib/geolocation';
import { useShopOpen } from '@/lib/shop';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { buildOrderMessage } from '@/lib/whatsapp-order';
import type { TableSpot } from '@/types';

/**
 * Where the customer is in the checkout flow.
 *
 * `cart` → (`details`) → (`spot`) → `note` → (`locating` → `location-error`)
 * → `sending`. The bracketed steps only appear when the order asks for those
 * things: `spot` on a table order, the location pair on a delivery.
 */
export type CheckoutStep =
    | 'cart'
    | 'details'
    | 'spot'
    | 'note'
    | 'locating'
    | 'location-error'
    | 'sending';

const NAME_STORAGE_KEY = 'pine-customer-name';
const PHONE_STORAGE_KEY = 'pine-customer-phone';

/** Minimum number of digits a phone number must contain to be accepted. */
const PHONE_MIN_DIGITS = 8;

/** Count the digits in a phone number, ignoring spaces, dashes and symbols. */
export function phoneDigitCount(value: string): number {
    return value.replace(/\D/g, '').length;
}

/** Read a value remembered from a previous order, if any. */
function readStored(key: string): string {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return window.localStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
}

/** Remember a value so it can be pre-filled on the next order. */
function store(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures (e.g. private mode quota).
    }
}

type CheckoutInput = {
    /** Whether this order is delivered to an address or seated at a table. */
    mode: CartMode;
    /** The number this menu's orders are sent to. */
    whatsappNumber: string | null;
    /** The tables an order can be seated at; empty in delivery mode. */
    spots: TableSpot[];
    items: CartItem[];
    pricing: PriceParts;
    subtotalUsd: number;
    deliveryFeeUsd: number | null;
    totalUsd: number;
};

/**
 * Drives the checkout: which step is showing, the details the shop asks for,
 * the location lookup, and the hand-off to WhatsApp.
 */
export function useCheckout({
    mode,
    whatsappNumber,
    spots,
    items,
    pricing,
    subtotalUsd,
    deliveryFeeUsd,
    totalUsd,
}: CheckoutInput) {
    const { checkout } = usePage().props;
    const { getClientLocation } = checkout;
    const tableMode = mode === 'table';
    // A table order has to say who it belongs to and which table it goes to, so
    // those two are asked for whatever the shop's own switches say. The name
    // switch still governs delivery on its own.
    const requireFullName = tableMode || checkout.requireFullName;
    const requireSpot = tableMode;
    // Nothing is phoned through to a table, so a table order never asks for a
    // number even where the shop wants one on a delivery.
    const requirePhoneNumber = !tableMode && checkout.requirePhoneNumber;
    // The customer is already here, so a table order never asks where they are.
    const wantsLocation = getClientLocation && !tableMode;
    // Orders can only be sent while the shop is open.
    const shopOpen = useShopOpen();

    const [step, setStep] = useState<CheckoutStep>('cart');
    const [name, setName] = useState(() => readStored(NAME_STORAGE_KEY));
    const [phone, setPhone] = useState(() => readStored(PHONE_STORAGE_KEY));
    // The chosen table. Deliberately not remembered between visits the way the
    // name is — a customer sits somewhere new each time.
    const [spotId, setSpotId] = useState<number | null>(null);
    const [orderNote, setOrderNote] = useState('');
    // True when the location failure was an explicit denial rather than a
    // timeout, so the panel can show the right instructions.
    const [locationDenied, setLocationDenied] = useState(false);
    // The built link, surfaced as a manual button in case the automatic
    // redirect is swallowed by the browser.
    const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

    // Guards against opening WhatsApp twice — e.g. if the location promise
    // resolves just after the customer chose to send without it.
    const sentRef = useRef(false);

    const canSend = whatsappNumber !== null && items.length > 0 && shopOpen;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const selectedSpot = spots.find((spot) => spot.id === spotId) ?? null;
    const detailsValid =
        (!requireFullName || trimmedName !== '') &&
        (!requirePhoneNumber ||
            phoneDigitCount(trimmedPhone) >= PHONE_MIN_DIGITS);
    const spotValid = !requireSpot || selectedSpot !== null;

    /** Reset the flow back to the item list, e.g. when the sheet is closed. */
    const reset = useCallback((): void => {
        setStep('cart');
        setLocationDenied(false);
        setWhatsappUrl(null);
        // Block any in-flight location lookup from sending after the fact.
        sentRef.current = true;
    }, []);

    const sendOrder = useCallback(
        (location: LocationResult | null, locationPending: boolean): void => {
            if (
                sentRef.current ||
                whatsappNumber === null ||
                items.length === 0 ||
                // The shop may have closed part-way through the flow.
                !shopOpen
            ) {
                return;
            }

            sentRef.current = true;

            const message = buildOrderMessage({
                seated: tableMode,
                items,
                pricing,
                subtotalUsd,
                deliveryFeeUsd,
                totalUsd,
                customerName: requireFullName ? name.trim() : null,
                customerPhone: requirePhoneNumber ? phone.trim() : null,
                tableName: selectedSpot?.name ?? null,
                location,
                locationPending,
                orderNote,
            });

            const url = buildWhatsAppUrl(whatsappNumber, message);

            setWhatsappUrl(url);
            setStep('sending');

            // Let the "Opening WhatsApp…" state paint before handing off. A
            // same-tab navigation (rather than window.open) is never blocked as
            // a popup — notably on iOS Safari — and deep-links into the app.
            window.setTimeout(() => {
                window.location.href = url;
            }, 600);
        },
        [
            whatsappNumber,
            shopOpen,
            items,
            pricing,
            subtotalUsd,
            deliveryFeeUsd,
            totalUsd,
            tableMode,
            requireFullName,
            requirePhoneNumber,
            name,
            phone,
            selectedSpot,
            orderNote,
        ],
    );

    /**
     * Resolve the location when the shop asks for one, then send. A failure
     * holds the order on the error step rather than sending a bad pin.
     */
    const beginSend = useCallback((): void => {
        sentRef.current = false;

        if (!wantsLocation) {
            sendOrder(null, false);

            return;
        }

        if (!('geolocation' in navigator)) {
            setLocationDenied(false);
            setStep('location-error');

            return;
        }

        setLocationDenied(false);
        setStep('locating');

        getBestLocation({ timeoutMs: 8000 })
            .then((location) => sendOrder(location, false))
            .catch((error: unknown) => {
                setLocationDenied(isPermissionDenied(error));
                setStep('location-error');
            });
    }, [wantsLocation, sendOrder]);

    /** Leave the item list for the first step the shop actually asks for. */
    const startCheckout = useCallback((): void => {
        if (!canSend) {
            return;
        }

        if (requireFullName || requirePhoneNumber) {
            setStep('details');

            return;
        }

        setStep(requireSpot ? 'spot' : 'note');
    }, [canSend, requireFullName, requirePhoneNumber, requireSpot]);

    const confirmDetails = useCallback((): void => {
        if (!detailsValid) {
            return;
        }

        if (requireFullName) {
            store(NAME_STORAGE_KEY, trimmedName);
            setName(trimmedName);
        }

        if (requirePhoneNumber) {
            store(PHONE_STORAGE_KEY, trimmedPhone);
            setPhone(trimmedPhone);
        }

        // A table order picks its table next; a delivery has everything it
        // needs and goes straight to the note.
        setStep(requireSpot ? 'spot' : 'note');
    }, [
        detailsValid,
        requireFullName,
        requirePhoneNumber,
        requireSpot,
        trimmedName,
        trimmedPhone,
    ]);

    const confirmNote = useCallback((): void => beginSend(), [beginSend]);

    const confirmSpot = useCallback((): void => {
        if (!spotValid) {
            return;
        }

        setStep('note');
    }, [spotValid]);

    /** Step back from the table step to the details, or to the item list. */
    const spotBack = useCallback((): void => {
        setStep(requireFullName || requirePhoneNumber ? 'details' : 'cart');
    }, [requireFullName, requirePhoneNumber]);

    /** Step back from the note to whichever step actually came before it. */
    const noteBack = useCallback((): void => {
        if (requireSpot) {
            setStep('spot');

            return;
        }

        setStep(requireFullName || requirePhoneNumber ? 'details' : 'cart');
    }, [requireFullName, requirePhoneNumber, requireSpot]);

    /** Send anyway, flagging that the customer will share a pin in the chat. */
    const sendWithoutLocation = useCallback((): void => {
        sentRef.current = false;
        sendOrder(null, true);
    }, [sendOrder]);

    return {
        step,
        requireFullName,
        requirePhoneNumber,
        requireSpot,
        spots,
        spotId,
        setSpotId,
        shopOpen,
        canSend,
        detailsValid,
        spotValid,
        locationDenied,
        whatsappUrl,
        name,
        setName,
        phone,
        setPhone,
        orderNote,
        setOrderNote,
        reset,
        startCheckout,
        confirmDetails,
        confirmSpot,
        spotBack,
        confirmNote,
        noteBack,
        retryLocation: beginSend,
        sendWithoutLocation,
        backToCart: useCallback((): void => setStep('cart'), []),
    };
}
