import type { CartMode } from '@/contexts/cart-context';

/**
 * The wording that separates the two carts. A delivery order goes into a cart
 * and travels to an address; a dine-in order is put on a table and stays where
 * the customer is sitting, so it is added *to the table* throughout.
 */
type CartCopy = {
    /** Accessible name for the header trigger. */
    trigger: (count: number) => string;
    /** Accessible name for a product's quick-add button. */
    add: (title: string) => string;
    /** The sheet's heading over the item list. */
    title: string;
    emptyTitle: string;
    /** The line under the details fields, saying why they're asked for. */
    detailsHint: string;
    /** The destructive action under the totals, and its armed confirmation. */
    clear: string;
    clearConfirm: string;
};

export const CART_COPY: Record<CartMode, CartCopy> = {
    delivery: {
        trigger: (count) => `Cart, ${count} ${count === 1 ? 'item' : 'items'}`,
        add: (title) => `Add ${title} to cart`,
        title: 'Your order',
        emptyTitle: 'Your order is empty',
        detailsHint:
            'We just need a couple of details to get your order to you.',
        clear: 'Empty the cart',
        clearConfirm: 'Tap again to empty',
    },
    table: {
        trigger: (count) =>
            `Table order, ${count} ${count === 1 ? 'item' : 'items'}`,
        add: (title) => `Add ${title} to the table`,
        title: 'Your table',
        emptyTitle: 'Nothing on your table yet',
        detailsHint: 'Tell us who you are and where you’re sitting.',
        clear: 'Clear the table',
        clearConfirm: 'Tap again to clear',
    },
};
