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
