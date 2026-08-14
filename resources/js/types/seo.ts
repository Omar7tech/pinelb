/**
 * The head copy the server already wrote for this page. Mirrors PHP
 * `App\Support\Seo::share()`.
 *
 * The full set of meta tags is rendered server-side in the root template — the
 * app has no SSR, so that is the only head a crawler ever reads. These two
 * fields come across so a client-side visit can retitle the tab to the same
 * words rather than a shorter in-app label.
 */
export type Seo = {
    /** The page title, matching the one served in the first HTML response. */
    title: string;
    /** The page's meta description. */
    description: string;
};
