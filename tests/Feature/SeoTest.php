<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Spot;
use App\Settings\GeneralSettings;
use App\Settings\ReservationSettings;
use App\Support\Seo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * The `@graph` node of the given type from the page's JSON-LD block.
 *
 * @return array<string, mixed>|null
 */
function schemaNode(string $html, string $type): ?array
{
    expect(preg_match('/<script type="application\/ld\+json">\s*(.+?)\s*<\/script>/s', $html, $matches))
        ->toBe(1, 'the page has a JSON-LD block');

    $graph = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);

    return collect($graph['@graph'])->firstWhere('@type', $type);
}

/** Turn everything on so each public page is reachable by default. */
beforeEach(function (): void {
    $settings = app(GeneralSettings::class);
    $settings->online_ordering_active = true;
    $settings->save();

    $reservations = app(ReservationSettings::class);
    $reservations->is_active = true;
    $reservations->save();
});

it('serves every public page with its own title, description and canonical', function (string $route, string $titlePart): void {
    $response = $this->get(route($route))->assertOk();
    $html = $response->getContent();

    expect($html)
        ->toContain('<title>')
        ->toContain($titlePart)
        ->toContain('<link rel="canonical" href="'.route($route).'">')
        ->toContain('<meta property="og:url" content="'.route($route).'">');

    // A description that is present but empty is the same as none at all.
    expect(preg_match('/<meta name="description" content="([^"]{80,})">/', $html))->toBe(1);
})->with([
    ['home', 'Open-Air Café'],
    ['menu.dine-in', 'Dine-In Menu'],
    ['menu.delivery', 'Delivery Menu'],
    ['spots.index', 'Reserve Your Spot'],
]);

it('gives each page its own Open Graph image', function (): void {
    $this->get(route('home'))->assertSee('og/home.jpg', false);
    $this->get(route('menu.dine-in'))->assertSee('og/menu.jpg', false);
    $this->get(route('spots.index'))->assertSee('og/reserve.jpg', false);
});

it('describes the business as a restaurant with its address, hours and coordinates', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->phone_number_enabled = true;
    $settings->phone_number = '+96171387946';
    $settings->opening_hours = [
        ['day' => 0, 'is_closed' => true, 'opens_at' => '09:00', 'closes_at' => '17:00'],
        ['day' => 1, 'is_closed' => false, 'opens_at' => '10:00', 'closes_at' => '23:00'],
    ];
    $settings->save();

    $restaurant = schemaNode($this->get(route('home'))->getContent(), 'Restaurant');

    expect($restaurant)->not->toBeNull()
        ->and($restaurant['telephone'])->toBe('+96171387946')
        ->and($restaurant['address']['addressLocality'])->toBe('Aley')
        ->and($restaurant['address']['addressCountry'])->toBe('LB')
        ->and($restaurant['geo']['latitude'])->toBe(Seo::LATITUDE)
        // The closed day is dropped; only the open one is published.
        ->and($restaurant['openingHoursSpecification'])->toHaveCount(1)
        ->and($restaurant['openingHoursSpecification'][0]['dayOfWeek'])->toBe('https://schema.org/Monday')
        ->and($restaurant['openingHoursSpecification'][0]['opens'])->toBe('10:00');
});

it('publishes the active menu as schema.org dishes, priced at what is charged', function (): void {
    $category = Category::factory()->create(['title' => 'Salads', 'is_active' => true]);
    Product::factory()->for($category)->create([
        'title' => 'Pine Salad',
        'description' => 'Lettuce, cranberries, walnut',
        'price' => 8,
        'discount_price' => 6.5,
        'is_active' => true,
    ]);
    Product::factory()->for($category)->create(['title' => 'Retired salad', 'is_active' => false]);

    $restaurant = schemaNode($this->get(route('menu.dine-in'))->getContent(), 'Restaurant');
    $section = collect($restaurant['hasMenu']['hasMenuSection'])->firstWhere('name', 'Salads');

    expect($section['hasMenuItem'])->toHaveCount(1)
        ->and($section['hasMenuItem'][0]['name'])->toBe('Pine Salad')
        // The discounted price is what a customer pays, so it is what is published.
        ->and($section['hasMenuItem'][0]['offers']['price'])->toBe('6.50')
        ->and($section['hasMenuItem'][0]['offers']['priceCurrency'])->toBe('USD');
});

it('keeps the dish-by-dish menu off the pages that do not show it', function (): void {
    $category = Category::factory()->create(['title' => 'Salads', 'is_active' => true]);
    Product::factory()->for($category)->create(['title' => 'Pine Salad', 'is_active' => true]);

    $restaurant = schemaNode($this->get(route('home'))->getContent(), 'Restaurant');

    // The landing page points at the menu rather than carrying every dish.
    expect($restaurant['hasMenu'])->toBe(route('menu.dine-in'));
    $this->get(route('home'))->assertDontSee('Pine Salad', false);
});

it('trails a breadcrumb back to the landing page', function (): void {
    $breadcrumb = schemaNode($this->get(route('spots.index'))->getContent(), 'BreadcrumbList');

    expect($breadcrumb['itemListElement'])->toHaveCount(2)
        ->and($breadcrumb['itemListElement'][0]['item'])->toBe(route('home'))
        ->and($breadcrumb['itemListElement'][1]['name'])->toBe('Reserve a spot')
        ->and($breadcrumb['itemListElement'][1]['position'])->toBe(2);
});

it('never publishes a social link that points back at our own site', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->social_links = [
        ['platform' => 'instagram', 'url' => 'https://instagram.com/pine.lb'],
        // A pasted admin URL must not go out as a public profile.
        ['platform' => 'facebook', 'url' => route('home').'/admin/manage-general'],
        ['platform' => 'tiktok', 'url' => ''],
    ];
    $settings->save();

    $restaurant = schemaNode($this->get(route('home'))->getContent(), 'Restaurant');

    expect($restaurant['sameAs'])->toBe(['https://instagram.com/pine.lb']);
});

it('puts the menu in the raw HTML for a crawler that does not run the app', function (): void {
    $category = Category::factory()->create(['title' => 'Crepes', 'is_active' => true]);
    Product::factory()->for($category)->create([
        'title' => 'Classic Nutella',
        'price' => 5,
        'discount_price' => null,
        'is_active' => true,
    ]);

    $html = $this->get(route('menu.dine-in'))->getContent();

    expect($html)
        ->toContain('<noscript>')
        ->toContain('Crepes')
        ->toContain('Classic Nutella');
});

it('serves crawl rules pointing at the sitemap and closing off the admin panel', function (): void {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Disallow: /admin', false)
        ->assertSee('Sitemap: '.route('seo.sitemap'), false);
});

it('lists every reachable page in the sitemap, with the page image', function (): void {
    Category::factory()->has(Product::factory())->create();
    Spot::factory()->create();

    $response = $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $xml = $response->getContent();

    expect($xml)
        ->toContain('<loc>'.route('home').'</loc>')
        ->toContain('<loc>'.route('menu.dine-in').'</loc>')
        ->toContain('<loc>'.route('menu.delivery').'</loc>')
        ->toContain('<loc>'.route('spots.index').'</loc>')
        ->toContain('<image:loc>')
        ->toContain('<lastmod>');

    // The document has to actually parse as XML, or Search Console rejects it.
    expect(simplexml_load_string($xml))->not->toBeFalse();
});

it('keeps a switched-off page out of the sitemap', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->online_ordering_active = false;
    $settings->save();

    $reservations = app(ReservationSettings::class);
    $reservations->is_active = false;
    $reservations->save();

    $xml = $this->get('/sitemap.xml')->getContent();

    expect($xml)
        ->toContain('<loc>'.route('menu.dine-in').'</loc>')
        ->not->toContain('<loc>'.route('menu.delivery').'</loc>')
        ->not->toContain('<loc>'.route('spots.index').'</loc>');
});

it('hands the SPA the same title the server wrote into the head', function (): void {
    $response = $this->get(route('menu.dine-in'))->assertOk();

    $title = app(Seo::class)->meta('menu.dine-in')['title'];

    expect($response->getContent())->toContain('<title>'.e($title).'</title>');
    expect(app(Seo::class)->share('menu.dine-in'))->toMatchArray(['title' => $title]);
});
