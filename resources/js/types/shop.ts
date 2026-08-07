/** How the shop's open/closed state is decided. Mirrors PHP `ShopStatusMode`. */
export type ShopStatusMode = 'manual' | 'automatic';

/** A single weekday's opening hours. `day` is JS-style (0 = Sunday). */
export type OpeningHours = {
    day: number;
    isClosed: boolean;
    /** `HH:mm`. */
    opensAt: string;
    /** `HH:mm`. Earlier than `opensAt` means it closes after midnight. */
    closesAt: string;
};

export type Shop = {
    /** The server's open/closed snapshot, used for the first render. */
    isOpen: boolean;
    /** Whether the state is driven by hand or by the weekly schedule. */
    statusMode: ShopStatusMode;
    /** The manual switch; only authoritative in `manual` mode. */
    isManuallyOpen: boolean;
    /** The weekly schedule; only authoritative in `automatic` mode. */
    openingHours: OpeningHours[];
};
