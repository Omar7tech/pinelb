/**
 * Where the shop is and how to reach it. Every field is null when the setting
 * behind it is switched off or left blank, so a page only has to ask whether it
 * has one before drawing it.
 */
export type Location = {
    /** A map link to open in a new tab. */
    mapUrl: string | null;
    /** The address of the embeddable map, for showing the map in the page. */
    mapIframeUrl: string | null;
    phoneNumber: string | null;
};
