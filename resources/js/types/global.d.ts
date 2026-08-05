import type { Auth } from '@/types/auth';
import type { Banner } from '@/types/banner';
import type { Checkout } from '@/types/checkout';
import type { Pricing } from '@/types/pricing';
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
            pricing: Pricing;
            checkout: Checkout;
            socials: Social[];
            onlineOrderingActive: boolean;
            whatsappNumber: string | null;
            whatsappBadge: { show: boolean; number: string | null };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
