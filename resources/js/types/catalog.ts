export type OrderType = 'dine_in' | 'delivery' | 'both';

export type ProductVariant = {
    name: string;
    price: number;
    discount_price: number | null;
};

export type Product = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    price: number;
    discount_price: number | null;
    order_type: OrderType;
    /** Rough preparation time in minutes, or null when not set. */
    preparation_time: number | null;
    is_featured: boolean;
    is_spicy: boolean;
    is_vegan: boolean;
    variants: ProductVariant[] | null;
    image: string | null;
    thumb: string | null;
};

/**
 * A table a dine-in order can be seated at — the bookable spots that are
 * switched on, as the dine-in menu is handed them.
 */
export type TableSpot = {
    id: number;
    name: string;
};

export type CategoryAddon = {
    name: string;
    price: number;
};

export type Category = {
    id: number;
    title: string;
    slug: string;
    image: string | null;
    addons: CategoryAddon[] | null;
    /** Only present when the endpoint eager-loads products (the menu page). */
    products?: Product[];
};

/**
 * A menu carousel slide. When `product` is set the slide is tappable and opens
 * that product's details; otherwise it is a plain decorative image.
 */
export type Slide = {
    id: number;
    /** Optional caption laid over the slide image. */
    text: string | null;
    image: string | null;
    product: Product | null;
    addons: CategoryAddon[] | null;
};
