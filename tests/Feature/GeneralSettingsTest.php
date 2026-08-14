<?php

use App\Enums\PriceDisplay;
use App\Enums\SocialPlatform;
use App\Settings\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

/**
 * Apply the given values to the general settings and persist them.
 *
 * @param  array<string, mixed>  $values
 */
function settings(array $values): GeneralSettings
{
    $settings = app(GeneralSettings::class);

    foreach ($values as $key => $value) {
        $settings->{$key} = $value;
    }

    $settings->save();

    return $settings;
}

it('falls back to USD when LBP pricing has no usable rate', function (): void {
    $settings = settings([
        'show_lbp_prices' => false,
        'lbp_exchange_rate' => 90000,
        'price_display' => PriceDisplay::BOTH,
    ]);

    expect($settings->usableLbpRate())->toBeNull()
        ->and($settings->resolvedPriceDisplay())->toBe(PriceDisplay::USD);

    $settings = settings(['show_lbp_prices' => true, 'lbp_exchange_rate' => 0]);

    expect($settings->usableLbpRate())->toBeNull()
        ->and($settings->resolvedPriceDisplay())->toBe(PriceDisplay::USD);
});

it('keeps the chosen display once LBP pricing has a rate', function (): void {
    $settings = settings([
        'show_lbp_prices' => true,
        'lbp_exchange_rate' => 90000,
        'price_display' => PriceDisplay::BOTH,
    ]);

    expect($settings->usableLbpRate())->toBe(90000.0)
        ->and($settings->resolvedPriceDisplay())->toBe(PriceDisplay::BOTH);
});

it('shares the resolved pricing with the storefront', function (): void {
    settings([
        'show_lbp_prices' => true,
        'lbp_exchange_rate' => 90000,
        'price_display' => PriceDisplay::LBP,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('pricing.display', 'lbp')
            // Whole floats come back from the JSON payload as ints.
            ->where('pricing.lbpRate', 90000));
});

it('shares the banner only while it is on and has text', function (): void {
    settings(['show_banner' => true, 'banner_text' => 'Now open']);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('banner.show', true)
            ->where('banner.text', 'Now open'));

    settings(['show_banner' => true, 'banner_text' => null]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page->where('banner.show', false));
});

it('withholds the orders number while the delivery menu is off', function (): void {
    settings(['online_ordering_active' => false, 'whatsapp_number' => '+9613000000']);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('onlineOrderingActive', false)
            ->where('whatsappNumber', null));
});

it('only charges delivery when it is on with a fee above zero', function (): void {
    expect(settings(['charge_delivery' => false, 'delivery_fee' => 3])->deliveryFeeUsd())->toBeNull()
        ->and(settings(['charge_delivery' => true, 'delivery_fee' => 0])->deliveryFeeUsd())->toBeNull()
        ->and(settings(['charge_delivery' => true, 'delivery_fee' => null])->deliveryFeeUsd())->toBeNull()
        ->and(settings(['charge_delivery' => true, 'delivery_fee' => 2.5])->deliveryFeeUsd())->toBe(2.5);
});

it('shares the delivery charge and the details asked for at checkout', function (): void {
    settings([
        'charge_delivery' => true,
        'delivery_fee' => 2.5,
        'require_full_name' => true,
        'require_phone_number' => false,
        'get_client_location' => true,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('pricing.deliveryFeeUsd', 2.5)
            ->where('checkout.requireFullName', true)
            ->where('checkout.requirePhoneNumber', false)
            ->where('checkout.getClientLocation', true));
});

it('only offers the map when it is on with a link', function (): void {
    expect(settings(['map_enabled' => false, 'map_url' => 'https://maps.app.goo.gl/pine'])->usableMapUrl())->toBeNull()
        ->and(settings(['map_enabled' => true, 'map_url' => null])->usableMapUrl())->toBeNull()
        ->and(settings(['map_enabled' => true, 'map_url' => 'https://maps.app.goo.gl/pine'])->usableMapUrl())
        ->toBe('https://maps.app.goo.gl/pine');
});

it('drops the embedded map when the map itself is off', function (): void {
    $embed = 'https://www.google.com/maps/embed?pb=pine';

    expect(settings([
        'map_enabled' => false,
        'map_iframe_enabled' => true,
        'map_iframe_url' => $embed,
    ])->usableMapIframeUrl())->toBeNull()
        ->and(settings(['map_enabled' => true, 'map_iframe_enabled' => false])->usableMapIframeUrl())->toBeNull()
        ->and(settings(['map_enabled' => true, 'map_iframe_enabled' => true])->usableMapIframeUrl())->toBe($embed);
});

it('only shows the phone number when it is on and set', function (): void {
    expect(settings(['phone_number_enabled' => false, 'phone_number' => '+9613000000'])->usablePhoneNumber())->toBeNull()
        ->and(settings(['phone_number_enabled' => true, 'phone_number' => ''])->usablePhoneNumber())->toBeNull()
        ->and(settings(['phone_number_enabled' => true, 'phone_number' => '+9613000000'])->usablePhoneNumber())
        ->toBe('+9613000000');
});

it('shares the location with the storefront, and withholds a map that is off', function (): void {
    settings([
        'map_enabled' => true,
        'map_url' => 'https://maps.app.goo.gl/pine',
        'map_iframe_enabled' => true,
        'map_iframe_url' => 'https://www.google.com/maps/embed?pb=pine',
        'phone_number_enabled' => true,
        'phone_number' => '+9613000000',
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('location.mapUrl', 'https://maps.app.goo.gl/pine')
            ->where('location.mapIframeUrl', 'https://www.google.com/maps/embed?pb=pine')
            ->where('location.phoneNumber', '+9613000000'));

    settings(['map_enabled' => false]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('location.mapUrl', null)
            ->where('location.mapIframeUrl', null)
            ->where('location.phoneNumber', '+9613000000'));
});

it('reads the address out of a pasted map embed snippet', function (): void {
    $snippet = '<iframe src="https://www.google.com/maps/embed?pb=pine" width="600" height="450"></iframe>';

    expect(GeneralSettings::embedSource($snippet))->toBe('https://www.google.com/maps/embed?pb=pine')
        ->and(GeneralSettings::embedSource('https://www.google.com/maps/embed?pb=pine'))
        ->toBe('https://www.google.com/maps/embed?pb=pine')
        ->and(GeneralSettings::embedSource(null))->toBeNull();
});

it('shares only the social links that name a known platform and a url', function (): void {
    settings([
        'social_links' => [
            ['platform' => SocialPlatform::INSTAGRAM->value, 'url' => 'https://instagram.com/pine'],
            ['platform' => 'myspace', 'url' => 'https://myspace.com/pine'],
            ['platform' => SocialPlatform::FACEBOOK->value, 'url' => ''],
        ],
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('socials', 1)
            ->where('socials.0.platform', 'instagram')
            ->where('socials.0.label', 'Instagram')
            ->where('socials.0.icon', '/social-icons/instagram.svg'));
});
