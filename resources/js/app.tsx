import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    // Pages pass through the full title the server already resolved for SEO —
    // the shop's name is part of it, so nothing is appended.
    title: (title) => title || appName,
    progress: {
        color: '#4B5563',
    },
});
