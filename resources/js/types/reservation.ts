/** One photo from a spot's gallery, in display order. */
export type SpotImage = {
    id: number;
    url: string;
    thumb: string;
};

/**
 * A bookable seat or table shown as a card on the reservation page. A spot with
 * `is_reserved` set is still listed, but marked as already taken.
 */
export type Spot = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount_price: number | null;
    is_reserved: boolean;
    /** Pin position on the spot map, in percent. Null until it's placed. */
    map_x: number | null;
    map_y: number | null;
    images: SpotImage[];
};

/** The reservation settings shared with every page. */
export type Reservations = {
    /** Whether spots can be booked at all. */
    active: boolean;
    /** Where requests are sent, or null when reservations can't be taken. */
    phoneNumber: string | null;
};
