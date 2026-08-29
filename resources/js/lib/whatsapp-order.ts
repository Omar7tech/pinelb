import { cartItemUnitUsd } from '@/contexts/cart-context';
import type { CartItem } from '@/contexts/cart-context';
import type { PriceParts } from '@/hooks/use-pricing';
import type { LocationResult } from '@/lib/geolocation';

type OrderSummary = {
    /** True for an order seated at a table rather than sent to an address. */
    seated?: boolean;
    items: CartItem[];
    pricing: PriceParts;
    subtotalUsd: number;
    /** Delivery charge in USD, or null when none applies. */
    deliveryFeeUsd: number | null;
    totalUsd: number;
    /** The customer's name, included when a full name is required. */
    customerName?: string | null;
    /** The customer's phone number, included when one is required. */
    customerPhone?: string | null;
    /** The table the order is seated at, on a dine-in order. */
    tableName?: string | null;
    /** The customer's coordinates, included when location sharing succeeded. */
    location?: LocationResult | null;
    /**
     * True when a location was wanted but couldn't be captured, so the customer
     * will share it by hand. Tells the shop to expect a pin to follow.
     */
    locationPending?: boolean;
    /** A free-text note for the whole order. */
    orderNote?: string | null;
};

/**
 * Format a USD amount in every currency the storefront displays, so the order
 * message matches what the customer saw on screen (e.g. "$6.00 / 540,000 LBP").
 */
function money(pricing: PriceParts, usd: number): string {
    const parts: string[] = [];

    if (pricing.showUsd) {
        parts.push(pricing.usd(usd));
    }

    if (pricing.showLbp) {
        parts.push(pricing.lbp(usd));
    }

    // Always fall back to USD so a line never renders empty.
    return parts.length > 0 ? parts.join(' / ') : pricing.usd(usd);
}

/**
 * Build the human-readable WhatsApp order message, using WhatsApp's `*bold*`
 * markup and a bulleted list so the shop can read the order at a glance.
 */
export function buildOrderMessage({
    seated,
    items,
    pricing,
    subtotalUsd,
    deliveryFeeUsd,
    totalUsd,
    customerName,
    customerPhone,
    tableName,
    location,
    locationPending,
    orderNote,
}: OrderSummary): string {
    const divider = '———————————————';
    // The heading says which kind of order this is, so the shop knows whether
    // to run it to a table or pack it for the road before reading a word more.
    const lines: string[] = [
        seated ? '*New table order — Pine*' : '*New order — Pine*',
        '',
    ];

    const name = customerName?.trim() ?? '';
    const phone = customerPhone?.trim() ?? '';
    const table = tableName?.trim() ?? '';

    if (name !== '') {
        lines.push(`*Name:* ${name}`);
    }

    if (table !== '') {
        lines.push(`*Table:* ${table}`);
    }

    if (phone !== '') {
        lines.push(`*Phone:* ${phone}`);
    }

    if (location) {
        const accuracy = Math.round(location.accuracy);
        // Flag coarse fixes so the shop knows the pin may be approximate.
        const precision =
            accuracy > 100 ? ` (approx. ±${accuracy}m)` : ` (±${accuracy}m)`;

        lines.push(
            `*Location:* https://maps.google.com/?q=${location.latitude},${location.longitude}${precision}`,
        );
    } else if (locationPending) {
        lines.push('*Location:* will be shared in this chat below');
    }

    if (
        name !== '' ||
        table !== '' ||
        phone !== '' ||
        location ||
        locationPending
    ) {
        lines.push('');
    }

    items.forEach((item) => {
        const lineTotalUsd = cartItemUnitUsd(item) * item.quantity;
        const title = item.variantName
            ? `${item.title} — ${item.variantName}`
            : item.title;

        // A bullet rather than a number: a leading "3." next to a line that
        // already reads "2 ×" invites the two to be read as the same count.
        lines.push(`• *${title}*`);
        lines.push(
            `   ${item.quantity} × ${money(pricing, item.unitUsd)} = ${money(pricing, item.unitUsd * item.quantity)}`,
        );

        item.addons.forEach((addon) => {
            const addonTotalUsd = addon.price * addon.quantity * item.quantity;

            lines.push(
                `   + ${addon.quantity * item.quantity}× ${addon.name} (+${money(pricing, addonTotalUsd)})`,
            );
        });

        if (item.addons.length > 0) {
            lines.push(`   = ${money(pricing, lineTotalUsd)}`);
        }

        const note = item.note?.trim() ?? '';

        if (note !== '') {
            lines.push(`   Note: _${note}_`);
        }

        lines.push('');
    });

    lines.push(divider);

    if (deliveryFeeUsd !== null) {
        lines.push(`Subtotal: ${money(pricing, subtotalUsd)}`);
        lines.push(`Delivery: ${money(pricing, deliveryFeeUsd)}`);
    }

    lines.push(`*TOTAL: ${money(pricing, totalUsd)}*`);

    const note = orderNote?.trim() ?? '';

    if (note !== '') {
        lines.push('', divider, `*Order note:* ${note}`);
    }

    return lines.join('\n');
}
