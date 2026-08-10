<?php

use App\Enums\ShopStatusMode;
use App\Settings\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

/**
 * Apply the given values to the general settings and persist them.
 *
 * @param  array<string, mixed>  $values
 */
function shopSettings(array $values): GeneralSettings
{
    $settings = app(GeneralSettings::class);

    foreach ($values as $key => $value) {
        $settings->{$key} = $value;
    }

    $settings->save();

    return $settings;
}

/**
 * A weekly schedule where every day shares the given hours.
 *
 * @return array<int, array{day: int, is_closed: bool, opens_at: string, closes_at: string}>
 */
function hoursEveryDay(string $opensAt, string $closesAt, bool $isClosed = false): array
{
    return array_map(static fn (array $day): array => [
        ...$day,
        'is_closed' => $isClosed,
        'opens_at' => $opensAt,
        'closes_at' => $closesAt,
    ], GeneralSettings::defaultOpeningHours());
}

it('follows the manual switch in manual mode', function (): void {
    $settings = shopSettings([
        'status_mode' => ShopStatusMode::MANUAL,
        'is_open' => true,
        // Hours that would say closed, to prove they are ignored here.
        'opening_hours' => hoursEveryDay('09:00', '17:00', isClosed: true),
    ]);

    expect($settings->isCurrentlyOpen())->toBeTrue();

    $settings = shopSettings(['is_open' => false]);

    expect($settings->isCurrentlyOpen())->toBeFalse();
});

it('follows the weekly schedule in automatic mode', function (): void {
    $settings = shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        // Manual switch off, to prove it is ignored here.
        'is_open' => false,
        'opening_hours' => hoursEveryDay('09:00', '17:00'),
    ]);

    expect($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 12:00')))->toBeTrue()
        ->and($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 08:59')))->toBeFalse()
        ->and($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 17:01')))->toBeFalse();
});

it('treats a closing time before the opening time as crossing midnight', function (): void {
    $settings = shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        'opening_hours' => hoursEveryDay('18:00', '02:00'),
    ]);

    expect($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 23:30')))->toBeTrue()
        ->and($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 01:30')))->toBeTrue()
        ->and($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 15:00')))->toBeFalse();
});

it('stays closed on a day marked closed', function (): void {
    $settings = shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        'opening_hours' => hoursEveryDay('09:00', '17:00', isClosed: true),
    ]);

    expect($settings->isCurrentlyOpen(Carbon::parse('2026-08-07 12:00')))->toBeFalse();
});

it('shares the shop status with the storefront', function (): void {
    shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        'is_open' => false,
        'opening_hours' => hoursEveryDay('09:00', '17:00'),
    ]);

    Carbon::setTestNow(Carbon::parse('2026-08-07 12:00'));

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('shop.isOpen', true)
            ->where('shop.statusMode', 'automatic')
            ->where('shop.isManuallyOpen', false)
            ->has('shop.openingHours', 7)
            ->where('shop.openingHours.0', [
                'day' => 0,
                'isClosed' => false,
                'opensAt' => '09:00',
                'closesAt' => '17:00',
            ])
        );

    Carbon::setTestNow();
});

it('stays closed on a malformed schedule rather than crashing', function (): void {
    // Sunday: `data_get()` reads null off a non-array row, and `null == 0`
    // used to match it against Sunday's day number.
    Carbon::setTestNow(Carbon::parse('2026-08-09 12:00'));

    $settings = shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        'opening_hours' => [
            ['day' => 0],
            'nonsense',
        ],
    ]);

    expect($settings->isCurrentlyOpen())->toBeFalse();

    Carbon::setTestNow();
});

it('drops malformed opening hours from the shared schedule', function (): void {
    shopSettings([
        'status_mode' => ShopStatusMode::AUTOMATIC,
        'opening_hours' => [
            ['day' => 1, 'is_closed' => false, 'opens_at' => '10:00', 'closes_at' => '22:00'],
            ['day' => 2],
            'nonsense',
        ],
    ]);

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('shop.openingHours', 1));
});
