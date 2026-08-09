import type { Auth } from '@/types/auth';
import type { Banner } from '@/types/banner';
import type { Checkout } from '@/types/checkout';
import type { Pricing } from '@/types/pricing';
import type { Reservations } from '@/types/reservation';
import type { Shop } from '@/types/shop';
import type { Social } from '@/types/social';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            banner: Banner;
            shop: Shop;
            pricing: Pricing;
            checkout: Checkout;
            socials: Social[];
            onlineOrderingActive: boolean;
            reservations: Reservations;
            whatsappNumber: string | null;
            whatsappBadge: { show: boolean; number: string | null };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
