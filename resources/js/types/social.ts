/** A social link shown in the menu footer. Mirrors PHP `SocialPlatform`. */
export type Social = {
    /** The platform key, e.g. `instagram`. */
    platform: string;
    /** The platform's display name, e.g. `Instagram`. */
    label: string;
    /** The link the icon points to. */
    url: string;
    /** Public path to the platform's icon. */
    icon: string;
};
