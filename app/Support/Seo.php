<?php

namespace App\Support;

use App\Enums\SocialPlatform;
use App\Enums\Weekday;
use App\Models\Category;
use App\Models\Product;
use App\Settings\GeneralSettings;
use App\Settings\ReservationSettings;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Everything the storefront needs to be found: the per-page meta tags, the
 * schema.org graph, and the sitemap's page list.
 *
 * The storefront is an Inertia SPA rendered without SSR, so React never gets to
 * write the head a crawler reads — the first HTML response has to carry the
 * whole story. This class resolves that story from the current route, and the
 * root template prints it before a single line of JavaScript runs.
 */
class Seo
{
    /** Where the shop sits, for the geo meta tags and the local-business graph. */
    public const LATITUDE = 33.79764;

    public const LONGITUDE = 35.59503;

    public const LOCALITY = 'Aley';

    public const REGION = 'Mount Lebanon';

    public const COUNTRY = 'LB';

    /** The Open Graph images are all shot at the same size. */
    private const IMAGE_WIDTH = 1729;

    private const IMAGE_HEIGHT = 910;

    public function __construct(
        private readonly GeneralSettings $settings,
        private readonly ReservationSettings $reservations,
    ) {}

    /**
     * The meta tags for the route being rendered, falling back to the landing
     * page's copy for anything unrecognised so no page is ever left bare.
     *
     * @return array{
     *     title: string,
     *     description: string,
     *     keywords: string,
     *     image: string,
     *     imageAlt: string,
     *     imageWidth: int,
     *     imageHeight: int,
     *     type: string,
     *     url: string,
     *     robots: string,
     * }
     */
    public function meta(?string $routeName = null): array
    {
        $page = $this->pages()[$routeName] ?? $this->pages()['home'];

        return [
            ...$page,
            'imageWidth' => self::IMAGE_WIDTH,
            'imageHeight' => self::IMAGE_HEIGHT,
            'url' => url()->current(),
            // Let Google use the full image and an untruncated snippet — a
            // photo of the place is the reason someone clicks it.
            'robots' => 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ];
    }

    /**
     * The just-enough slice of the meta shared with the SPA, so a client-side
     * visit retitles the tab exactly the way the server would have.
     *
     * @return array{title: string, description: string}
     */
    public function share(?string $routeName = null): array
    {
        $meta = $this->meta($routeName);

        return [
            'title' => $meta['title'],
            'description' => $meta['description'],
        ];
    }

    /**
     * The schema.org graph for this route: the restaurant itself, the site, the
     * page being viewed, its breadcrumb trail, and — on the menu pages — the
     * whole menu as machine-readable dishes.
     *
     * One `@graph` rather than several loose scripts, so every node can point
     * at the others by `@id` and Google reads them as one business.
     *
     * @return array<string, mixed>
     */
    public function structuredData(?string $routeName = null): array
    {
        $nodes = [
            $this->restaurantNode($routeName),
            $this->websiteNode(),
            $this->webPageNode($routeName),
            $this->breadcrumbNode($routeName),
        ];

        return [
            '@context' => 'https://schema.org',
            '@graph' => array_values(array_filter($nodes)),
        ];
    }

    /**
     * The public pages a crawler should know about, newest change first hand.
     * The delivery menu is only listed while online ordering is on, and the
     * reservation page only while reservations are being taken — a URL that
     * redirects has no business in a sitemap.
     *
     * @return array<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string, image: string, caption: string}>
     */
    public function sitemapPages(): array
    {
        $menuChangedAt = $this->menuLastModified();

        $pages = [[
            'route' => 'home',
            'lastmod' => $menuChangedAt,
            'changefreq' => 'weekly',
            'priority' => '1.0',
        ], [
            'route' => 'menu.dine-in',
            'lastmod' => $menuChangedAt,
            'changefreq' => 'weekly',
            'priority' => '0.9',
        ]];

        if ($this->settings->online_ordering_active) {
            $pages[] = [
                'route' => 'menu.delivery',
                'lastmod' => $menuChangedAt,
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ];
        }

        if ($this->reservations->is_active) {
            $pages[] = [
                'route' => 'spots.index',
                'lastmod' => $this->spotsLastModified(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        return array_map(function (array $page): array {
            $meta = $this->pages()[$page['route']];

            return [
                'loc' => route($page['route']),
                'lastmod' => $page['lastmod'],
                'changefreq' => $page['changefreq'],
                'priority' => $page['priority'],
                'image' => $meta['image'],
                'caption' => $meta['imageAlt'],
            ];
        }, $pages);
    }

    /**
     * The crawl rules. The admin panel, the storage symlink and Laravel's
     * health check are all closed off; everything a customer can see is open.
     *
     * @return array<int, string>
     */
    public function robotsLines(): array
    {
        return [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /admin/*',
            'Disallow: /storage/',
            'Disallow: /up',
            '',
            // Crawlers that hammer a small shared host for nothing in return.
            'User-agent: AhrefsBot',
            'Crawl-delay: 10',
            '',
            'User-agent: SemrushBot',
            'Crawl-delay: 10',
            '',
            'Sitemap: '.route('seo.sitemap'),
            '',
        ];
    }

    /**
     * The menu flattened to plain text — section names, dish names, and prices.
     *
     * The storefront paints the menu in React, so a crawler that indexes before
     * it runs the page's JavaScript sees no dishes at all. The root template
     * prints this outline in a `<noscript>` block, which puts the same words in
     * the raw HTML for that first pass without showing a customer anything
     * twice. Read off the cached menu graph, so it costs no extra query.
     *
     * @return array<int, array{name: string, items: array<int, array{name: string, price: string|null}>}>
     */
    public function menuOutline(): array
    {
        $menu = $this->menuNode();

        if ($menu === null) {
            return [];
        }

        return array_map(fn (array $section): array => [
            'name' => (string) $section['name'],
            'items' => array_map(fn (array $item): array => [
                'name' => (string) $item['name'],
                'price' => $item['offers']['price'] ?? null,
            ], $section['hasMenuItem'] ?? []),
        ], $menu['hasMenuSection']);
    }

    /**
     * The per-page copy. Titles stay under ~60 characters so Google prints them
     * whole, and each description carries the Arabic a customer here is just as
     * likely to search in as the English.
     *
     * @return array<string, array{title: string, description: string, keywords: string, image: string, imageAlt: string, type: string}>
     */
    private function pages(): array
    {
        $keywords = 'Pine Aley, cafe Aley, restaurant Aley, outdoor cafe Lebanon, coffee Aley, '
            .'crepe Aley, waffle Aley, saj Aley, burger Aley, breakfast Aley, fresh juice Aley, '
            .'Mount Lebanon cafe, باين عاليه, مقهى عاليه, كافيه عاليه, مطعم عاليه, '
            .'كريب عاليه, صاج عاليه, برغر عاليه, قهوة عاليه';

        return [
            'home' => [
                'title' => 'Pine — Open-Air Café & Restaurant in Aley, Lebanon',
                'description' => 'Pine in Aley, Mount Lebanon — coffee, crepes, saj, burgers and fresh '
                    .'juices served in the open air under the pines. Dine in, order delivery, or '
                    .'reserve your own spot. مقهى ومطعم باين في عاليه — احجز قعدتك بين الصنوبر.',
                'keywords' => $keywords,
                'image' => asset('og/home.jpg'),
                'imageAlt' => 'The open-air seating at Pine, Aley, set among the pine trees',
                'type' => 'restaurant.restaurant',
            ],
            'menu.dine-in' => [
                'title' => 'Dine-In Menu — Pine Café & Restaurant, Aley',
                'description' => 'The full Pine dine-in menu: crepes, waffles and pancakes, saj, '
                    .'burgers, plates, salads, matte, specialty coffee and fresh juices, with prices. '
                    .'منيو باين عاليه — كريب، صاج، برغر، قهوة وعصير طازج.',
                'keywords' => 'Pine menu, menu Aley, dine in Aley, '.$keywords,
                'image' => asset('og/menu.jpg'),
                'imageAlt' => 'Dishes from the Pine menu, laid out on a table',
                'type' => 'restaurant.menu',
            ],
            'menu.delivery' => [
                'title' => 'Delivery Menu — Order Online from Pine, Aley',
                'description' => 'Order Pine to your door in Aley and around: crepes, saj, burgers, '
                    .'plates, salads, coffee and fresh juices, sent straight to us on WhatsApp. '
                    .'توصيل باين عاليه — اطلب أونلاين عبر واتساب.',
                'keywords' => 'Pine delivery, delivery Aley, order online Aley, توصيل عاليه, '.$keywords,
                'image' => asset('og/menu.jpg'),
                'imageAlt' => 'Dishes from the Pine menu, laid out on a table',
                'type' => 'restaurant.menu',
            ],
            'spots.index' => [
                'title' => 'Reserve Your Spot Under the Pines — Pine, Aley',
                'description' => 'Pick your seat at Pine in Aley before you come: every spot on the '
                    .'grounds, shown on the map with photos, booked in a WhatsApp message. '
                    .'احجز قعدتك في باين عاليه — اختر مكانك بين الصنوبر.',
                'keywords' => 'reserve Aley, booking Aley, حجز عاليه, احجز قعدتك, '.$keywords,
                'image' => asset('og/reserve.jpg'),
                'imageAlt' => 'A reservable seating spot at Pine, set under the pine trees',
                'type' => 'website',
            ],
        ];
    }

    /**
     * The business itself: where it is, when it opens, what it serves, and how
     * an order or a reservation reaches it. This is the node the local pack and
     * the knowledge panel are built from.
     *
     * The full dish-by-dish menu only rides along on the menu pages, where it
     * is what the page is about. Everywhere else `hasMenu` is the plain URL of
     * the menu — schema.org takes either, and the landing page stays light
     * instead of carrying twenty kilobytes of JSON a customer never reads.
     *
     * @return array<string, mixed>
     */
    private function restaurantNode(?string $routeName): array
    {
        $home = route('home');
        $phone = $this->settings->usablePhoneNumber();
        $onMenuPage = in_array($routeName, ['menu.dine-in', 'menu.delivery'], true);

        return array_filter([
            '@type' => 'Restaurant',
            '@id' => $home.'#restaurant',
            'name' => config('app.name', 'Pine'),
            'alternateName' => 'باين',
            'slogan' => 'Breathe Nature',
            'description' => $this->pages()['home']['description'],
            'url' => $home,
            'logo' => asset('web-app-manifest-512x512.png'),
            'image' => [
                asset('og/home.jpg'),
                asset('og/menu.jpg'),
                asset('og/reserve.jpg'),
            ],
            'telephone' => $phone,
            'priceRange' => '$$',
            'currenciesAccepted' => $this->settings->usableLbpRate() !== null ? 'USD, LBP' : 'USD',
            'paymentAccepted' => 'Cash',
            'servesCuisine' => ['Cafe', 'Lebanese', 'Breakfast', 'Burgers', 'Desserts'],
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => self::LOCALITY,
                'addressRegion' => self::REGION,
                'addressCountry' => self::COUNTRY,
            ],
            'geo' => [
                '@type' => 'GeoCoordinates',
                'latitude' => self::LATITUDE,
                'longitude' => self::LONGITUDE,
            ],
            'hasMap' => $this->settings->usableMapUrl(),
            'areaServed' => [
                '@type' => 'City',
                'name' => self::LOCALITY,
                'containedInPlace' => [
                    '@type' => 'AdministrativeArea',
                    'name' => self::REGION,
                ],
            ],
            'amenityFeature' => [
                [
                    '@type' => 'LocationFeatureSpecification',
                    'name' => 'Outdoor seating',
                    'value' => true,
                ],
                [
                    '@type' => 'LocationFeatureSpecification',
                    'name' => 'Parking',
                    'value' => true,
                ],
            ],
            'publicAccess' => true,
            'acceptsReservations' => $this->reservations->usablePhoneNumber() !== null,
            'openingHoursSpecification' => $this->openingHoursSpecification(),
            'hasMenu' => $onMenuPage ? $this->menuNode() : route('menu.dine-in'),
            'sameAs' => $this->sameAs(),
            'potentialAction' => $this->potentialActions(),
        ], fn (mixed $value): bool => $value !== null && $value !== [] && $value !== '');
    }

    /**
     * The site as a whole, so Google attributes every page to one publisher.
     *
     * @return array<string, mixed>
     */
    private function websiteNode(): array
    {
        $home = route('home');

        return [
            '@type' => 'WebSite',
            '@id' => $home.'#website',
            'url' => $home,
            'name' => config('app.name', 'Pine'),
            'inLanguage' => ['en', 'ar'],
            'publisher' => ['@id' => $home.'#restaurant'],
        ];
    }

    /**
     * The page being viewed, tied back to the site and the business.
     *
     * @return array<string, mixed>
     */
    private function webPageNode(?string $routeName): array
    {
        $home = route('home');
        $meta = $this->meta($routeName);

        return [
            '@type' => 'WebPage',
            '@id' => $meta['url'].'#webpage',
            'url' => $meta['url'],
            'name' => $meta['title'],
            'description' => $meta['description'],
            'isPartOf' => ['@id' => $home.'#website'],
            'about' => ['@id' => $home.'#restaurant'],
            'primaryImageOfPage' => [
                '@type' => 'ImageObject',
                'url' => $meta['image'],
                'width' => self::IMAGE_WIDTH,
                'height' => self::IMAGE_HEIGHT,
                'caption' => $meta['imageAlt'],
            ],
            'inLanguage' => 'en',
            'breadcrumb' => ['@id' => $meta['url'].'#breadcrumb'],
        ];
    }

    /**
     * The trail from the landing page to this one. Every page here is one hop
     * from home, so the deepest trail is two items — which is exactly what
     * Google needs to print the breadcrumb line under the result.
     *
     * @return array<string, mixed>
     */
    private function breadcrumbNode(?string $routeName): array
    {
        $trail = [['name' => 'Home', 'url' => route('home')]];

        $leaf = match ($routeName) {
            'menu.dine-in' => ['name' => 'Dine-in menu', 'url' => route('menu.dine-in')],
            'menu.delivery' => ['name' => 'Delivery menu', 'url' => route('menu.delivery')],
            'spots.index' => ['name' => 'Reserve a spot', 'url' => route('spots.index')],
            default => null,
        };

        if ($leaf !== null) {
            $trail[] = $leaf;
        }

        return [
            '@type' => 'BreadcrumbList',
            '@id' => url()->current().'#breadcrumb',
            'itemListElement' => array_map(fn (array $crumb, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb['name'],
                'item' => $crumb['url'],
            ], $trail, array_keys($trail)),
        ];
    }

    /**
     * The menu as schema.org sections and dishes, so individual items can
     * surface in Google rather than only the shop's name.
     *
     * Built from the same active-and-ordered set the storefront renders, and
     * cached under a key made of the menu's own timestamps — an edit in the
     * admin panel changes the key, so the schema is never stale and never
     * costs a rebuild on an untouched menu.
     *
     * @return array<string, mixed>|null
     */
    private function menuNode(): ?array
    {
        $fingerprint = $this->menuFingerprint();

        if ($fingerprint === null) {
            return null;
        }

        return Cache::remember(
            "seo.menu.{$fingerprint}",
            now()->addDay(),
            fn (): ?array => $this->buildMenuNode(),
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function buildMenuNode(): ?array
    {
        $sections = Category::query()
            ->where('is_active', true)
            ->with(['products' => fn ($query) => $query
                ->where('is_active', true)
                ->orderBy('sort_order'), 'products.media', 'media'])
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Category $category): bool => $category->products->isNotEmpty())
            ->map(fn (Category $category): array => array_filter([
                '@type' => 'MenuSection',
                'name' => $category->title,
                'image' => $category->getFirstMediaUrl('image', 'webp') ?: null,
                'hasMenuItem' => $category->products
                    ->map(fn (Product $product): array => $this->menuItemNode($product))
                    ->values()
                    ->all(),
            ]))
            ->values()
            ->all();

        if ($sections === []) {
            return null;
        }

        return [
            '@type' => 'Menu',
            '@id' => route('menu.dine-in').'#menu',
            'name' => 'Pine menu',
            'url' => route('menu.dine-in'),
            'inLanguage' => 'en',
            'hasMenuSection' => $sections,
        ];
    }

    /**
     * One dish, priced at what a customer actually pays — the discounted price
     * when there is one — and flagged with the dietary hints we hold.
     *
     * @return array<string, mixed>
     */
    private function menuItemNode(Product $product): array
    {
        $price = (float) ($product->discount_price ?? $product->price);

        return array_filter([
            '@type' => 'MenuItem',
            'name' => $product->title,
            'description' => $product->description ?: $product->subtitle ?: null,
            'image' => $product->getFirstMediaUrl('image', 'webp') ?: null,
            'suitableForDiet' => $product->is_vegan ? 'https://schema.org/VeganDiet' : null,
            'offers' => [
                '@type' => 'Offer',
                'price' => number_format($price, 2, '.', ''),
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
                'availableAtOrFrom' => ['@id' => route('home').'#restaurant'],
            ],
        ], fn (mixed $value): bool => $value !== null);
    }

    /**
     * The weekly schedule in schema.org's shape, skipping closed days. A
     * closing time at or before the opening time runs past midnight, which
     * schema.org writes as an hour past 24:00.
     *
     * @return array<int, array<string, string>>
     */
    private function openingHoursSpecification(): array
    {
        return collect($this->settings->opening_hours)
            ->filter(fn (mixed $hours): bool => is_array($hours)
                && ! ($hours['is_closed'] ?? false)
                && filled($hours['opens_at'] ?? null)
                && filled($hours['closes_at'] ?? null)
                && Weekday::tryFrom((int) ($hours['day'] ?? -1)) !== null)
            ->map(fn (array $hours): array => [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => 'https://schema.org/'.Weekday::from((int) $hours['day'])->getLabel(),
                'opens' => (string) $hours['opens_at'],
                'closes' => (string) $hours['closes_at'],
            ])
            ->values()
            ->all();
    }

    /**
     * The shop's profiles elsewhere, so Google can tie them to this business.
     * A link that points back at our own domain is dropped — an admin URL
     * pasted into the field by mistake must never be published as a profile.
     *
     * @return array<int, string>
     */
    private function sameAs(): array
    {
        $host = parse_url(route('home'), PHP_URL_HOST);

        return collect($this->settings->social_links)
            ->filter(fn (mixed $link): bool => is_array($link)
                && SocialPlatform::tryFrom((string) ($link['platform'] ?? '')) !== null
                && filled($link['url'] ?? null))
            ->map(fn (array $link): string => (string) $link['url'])
            ->filter(fn (string $url): bool => filter_var($url, FILTER_VALIDATE_URL) !== false
                && parse_url($url, PHP_URL_HOST) !== $host)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * What a customer can do from here: send an order, and book a spot. Both
     * land in WhatsApp, which is where this shop actually takes them.
     *
     * @return array<int, array<string, mixed>>
     */
    private function potentialActions(): array
    {
        $actions = [];

        $orderNumber = $this->settings->online_ordering_active
            ? $this->whatsappLink($this->settings->whatsapp_number, 'Hello Pine, I would like to place an order')
            : null;

        if ($orderNumber !== null) {
            $actions[] = [
                '@type' => 'OrderAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => $orderNumber,
                    'inLanguage' => 'en',
                    'actionPlatform' => [
                        'https://schema.org/DesktopWebPlatform',
                        'https://schema.org/MobileWebPlatform',
                    ],
                ],
                'deliveryMethod' => ['https://purl.org/goodrelations/v1#DeliveryModeOwnFleet'],
            ];
        }

        $reserveNumber = $this->whatsappLink(
            $this->reservations->usablePhoneNumber(),
            'Hello Pine, I would like to reserve a spot',
        );

        if ($reserveNumber !== null) {
            $actions[] = [
                '@type' => 'ReserveAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => $reserveNumber,
                    'inLanguage' => 'en',
                    'actionPlatform' => [
                        'https://schema.org/DesktopWebPlatform',
                        'https://schema.org/MobileWebPlatform',
                    ],
                ],
                'result' => ['@type' => 'Reservation', 'name' => 'Spot reservation'],
            ];
        }

        return $actions;
    }

    /**
     * A wa.me link for the given number, or null when there is no number to
     * link to. Everything that isn't a digit is stripped, so a number stored
     * as `+961 71 387 946` still produces a valid link.
     */
    private function whatsappLink(?string $number, string $message): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $number);

        if (blank($digits)) {
            return null;
        }

        return "https://wa.me/{$digits}?text=".rawurlencode($message);
    }

    /**
     * A short signature of the menu's current state — how many rows there are
     * and when one last changed — used to key the cached menu schema.
     */
    private function menuFingerprint(): ?string
    {
        try {
            $menu = $this->menuStamp();
        } catch (\Throwable) {
            // The menu tables aren't there yet (a fresh install mid-migration);
            // the graph simply goes out without a menu.
            return null;
        }

        return $menu === null ? null : md5($menu);
    }

    /** The count-and-timestamp signature of every table the menu is built from. */
    private function menuStamp(): ?string
    {
        $stamp = collect(['categories', 'products'])
            ->map(fn (string $table): string => (string) DB::table($table)->count()
                .'|'.(string) DB::table($table)->max('updated_at'))
            ->implode('|');

        return $stamp === '0||0|' ? null : $stamp;
    }

    /** When the menu last changed, as a sitemap `lastmod`. */
    private function menuLastModified(): ?string
    {
        return $this->lastModified(['categories', 'products']);
    }

    /** When the reservable spots last changed, as a sitemap `lastmod`. */
    private function spotsLastModified(): ?string
    {
        return $this->lastModified(['spots']);
    }

    /**
     * The most recent `updated_at` across the given tables, in the W3C format
     * a sitemap expects, or null when nothing has ever been saved.
     *
     * @param  array<int, string>  $tables
     */
    private function lastModified(array $tables): ?string
    {
        try {
            $latest = collect($tables)
                ->map(fn (string $table): ?string => DB::table($table)->max('updated_at'))
                ->filter()
                ->max();
        } catch (\Throwable) {
            return null;
        }

        return $latest === null ? null : now()->parse($latest)->toAtomString();
    }
}
