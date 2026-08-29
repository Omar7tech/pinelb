import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';

/**
 * What the cart is being built for: an order delivered to an address, or one
 * seated at a table. It only changes the wording and what checkout asks for —
 * the items themselves behave identically.
 */
export type CartMode = 'delivery' | 'table';

export type CartAddon = {
    name: string;
    /** Unit price of the add-on in USD. */
    price: number;
    quantity: number;
};

export type CartItem = {
    /** Unique per product + variant + add-ons combination. */
    key: string;
    productId: number;
    title: string;
    variantName: string | null;
    /** Effective (discounted) base unit price in USD, excluding add-ons. */
    unitUsd: number;
    /** Chosen optional extras; their prices are added on top of `unitUsd`. */
    addons: CartAddon[];
    image: string | null;
    quantity: number;
    /** Optional free-text note for this line, e.g. "no onions". */
    note?: string;
};

export type AddToCartInput = {
    productId: number;
    variantIndex: number | null;
    title: string;
    variantName: string | null;
    unitUsd: number;
    image: string | null;
    addons?: CartAddon[];
};

/** The per-unit price of a cart line including its add-ons. */
export function cartItemUnitUsd(item: CartItem): number {
    return item.addons.reduce(
        (total, addon) => total + addon.price * addon.quantity,
        item.unitUsd,
    );
}

/** A stable signature for a set of add-ons, so identical selections share a key. */
function addonsSignature(addons: CartAddon[]): string {
    return addons
        .filter((addon) => addon.quantity > 0)
        .map((addon) => `${addon.name}x${addon.quantity}`)
        .sort()
        .join(',');
}

/** Cart data that changes as items are added or the sheet is toggled. */
type CartState = {
    items: CartItem[];
    count: number;
    subtotalUsd: number;
    open: boolean;
    /**
     * The most recently added item. The `nonce` changes on every add — even when
     * the same product is re-added — so a toast can react to each one.
     */
    lastAdded: { nonce: number; title: string } | null;
};

/** Cart mutators with stable identities, safe to depend on without re-renders. */
type CartActions = {
    setOpen: (open: boolean) => void;
    addItem: (input: AddToCartInput) => void;
    increment: (key: string) => void;
    decrement: (key: string) => void;
    removeItem: (key: string) => void;
    setNote: (key: string, note: string) => void;
    clear: () => void;
};

type CartContextValue = CartState & CartActions;

// State and actions live in separate contexts, so components that only fire
// actions (a product card's "add") don't re-render when the cart changes.
const CartStateContext = createContext<CartState | null>(null);
const CartActionsContext = createContext<CartActions | null>(null);
// The mode never changes within a page, so it sits in its own context rather
// than re-rendering every cart consumer alongside the items.
const CartModeContext = createContext<CartMode>('delivery');

const STORAGE_KEY = 'pine-cart';

function readStoredItems(): CartItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        return (JSON.parse(raw) as CartItem[]).map((item) => ({
            ...item,
            addons: item.addons ?? [],
        }));
    } catch {
        return [];
    }
}

export function CartProvider({
    mode = 'delivery',
    children,
}: {
    mode?: CartMode;
    children: ReactNode;
}) {
    const [items, setItems] = useState<CartItem[]>(readStoredItems);
    const [open, setOpen] = useState(false);
    const [lastAdded, setLastAdded] = useState<{
        nonce: number;
        title: string;
    } | null>(null);
    // Monotonic counter so re-adding the same product still triggers the toast.
    const addNonceRef = useRef(0);

    // Persist the cart so it survives navigations and reloads.
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Ignore storage failures (e.g. private mode quota).
        }
    }, [items]);

    const addItem = useCallback((input: AddToCartInput): void => {
        const addons = (input.addons ?? []).filter(
            (addon) => addon.quantity > 0,
        );
        const signature = addonsSignature(addons);
        const key = `${input.productId}:${input.variantIndex ?? 'base'}${
            signature ? `:${signature}` : ''
        }`;

        setItems((previous) => {
            const existing = previous.find((item) => item.key === key);

            if (existing) {
                return previous.map((item) =>
                    item.key === key
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [
                ...previous,
                {
                    key,
                    productId: input.productId,
                    title: input.title,
                    variantName: input.variantName,
                    unitUsd: input.unitUsd,
                    addons,
                    image: input.image,
                    quantity: 1,
                },
            ];
        });

        // Signal a toast rather than opening the whole cart, so adding several
        // items in a row doesn't keep interrupting the customer.
        addNonceRef.current += 1;
        setLastAdded({ nonce: addNonceRef.current, title: input.title });
    }, []);

    const increment = useCallback((key: string): void => {
        setItems((previous) =>
            previous.map((item) =>
                item.key === key
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
            ),
        );
    }, []);

    const decrement = useCallback((key: string): void => {
        setItems((previous) =>
            previous
                .map((item) =>
                    item.key === key
                        ? { ...item, quantity: item.quantity - 1 }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    }, []);

    const removeItem = useCallback((key: string): void => {
        setItems((previous) => previous.filter((item) => item.key !== key));
    }, []);

    const setNote = useCallback((key: string, note: string): void => {
        setItems((previous) =>
            previous.map((item) =>
                item.key === key ? { ...item, note } : item,
            ),
        );
    }, []);

    const clear = useCallback((): void => setItems([]), []);

    const actions = useMemo<CartActions>(
        () => ({
            setOpen,
            addItem,
            increment,
            decrement,
            removeItem,
            setNote,
            clear,
        }),
        [addItem, increment, decrement, removeItem, setNote, clear],
    );

    const state = useMemo<CartState>(
        () => ({
            items,
            count: items.reduce((total, item) => total + item.quantity, 0),
            subtotalUsd: items.reduce(
                (total, item) => total + cartItemUnitUsd(item) * item.quantity,
                0,
            ),
            open,
            lastAdded,
        }),
        [items, open, lastAdded],
    );

    return (
        <CartModeContext value={mode}>
            <CartActionsContext value={actions}>
                <CartStateContext value={state}>{children}</CartStateContext>
            </CartActionsContext>
        </CartModeContext>
    );
}

/** Whether this cart is a delivery order or a table order. */
export function useCartMode(): CartMode {
    return useContext(CartModeContext);
}

/** Cart mutators only; identity is stable so consumers don't re-render. */
export function useCartActions(): CartActions {
    const context = useContext(CartActionsContext);

    if (context === null) {
        throw new Error('useCartActions must be used within a CartProvider.');
    }

    return context;
}

/** Cart state plus actions; re-renders when the cart contents change. */
export function useCart(): CartContextValue {
    const state = useContext(CartStateContext);
    const actions = useContext(CartActionsContext);

    if (state === null || actions === null) {
        throw new Error('useCart must be used within a CartProvider.');
    }

    return { ...state, ...actions };
}
