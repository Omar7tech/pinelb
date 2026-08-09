<?php

use App\Models\Spot;
use App\Settings\ReservationSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

/**
 * Apply the given values to the reservation settings and persist them.
 *
 * @param  array<string, mixed>  $values
 */
function reservationSettings(array $values): ReservationSettings
{
    $settings = app(ReservationSettings::class);

    foreach ($values as $key => $value) {
        $settings->{$key} = $value;
    }

    $settings->save();

    return $settings;
}

it('renders the reservation page with its spots', function (): void {
    Spot::factory()->create([
        'name' => 'Garden corner',
        'description' => 'Under the pines.',
        'price' => 25,
    ]);

    $this->get(route('spots.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('spots')
            ->has('spots', 1)
            ->where('spots.0.name', 'Garden corner')
            ->where('spots.0.slug', 'garden-corner')
            ->where('spots.0.description', 'Under the pines.')
            ->where('spots.0.price', 25)
            ->where('spots.0.discount_price', null)
            ->where('spots.0.is_reserved', false)
            ->has('spots.0.images', 0));
});

it('hides inactive spots', function (): void {
    Spot::factory()->create(['name' => 'Live']);
    Spot::factory()->inactive()->create(['name' => 'Retired']);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('spots', 1)
            ->where('spots.0.name', 'Live'));
});

it('keeps reserved spots on the page, flagged as taken', function (): void {
    Spot::factory()->reserved()->create(['name' => 'Booked booth']);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('spots', 1)
            ->where('spots.0.name', 'Booked booth')
            ->where('spots.0.is_reserved', true));
});

it('orders spots by their sort order', function (): void {
    Spot::factory()->create(['name' => 'Second', 'sort_order' => 2]);
    Spot::factory()->create(['name' => 'First', 'sort_order' => 1]);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('spots.0.name', 'First')
            ->where('spots.1.name', 'Second'));
});

it('sends the discount price when the spot is on offer', function (): void {
    Spot::factory()->discounted(15)->create(['name' => 'Sale seat']);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('spots.0.price', 30)
            ->where('spots.0.discount_price', 15));
});

it('sends customers home while reservations are switched off', function (): void {
    reservationSettings(['is_active' => false]);
    Spot::factory()->create();

    $this->get(route('spots.index'))->assertRedirect(route('home'));
});

it('shares the reservation number while reservations are on', function (): void {
    reservationSettings([
        'is_active' => true,
        'phone_number' => '+96171387946',
    ]);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('reservations.active', true)
            ->where('reservations.phoneNumber', '+96171387946'));
});

it('withholds the reservation number when none is configured', function (): void {
    $settings = reservationSettings([
        'is_active' => true,
        'phone_number' => null,
    ]);

    expect($settings->usablePhoneNumber())->toBeNull();

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('reservations.phoneNumber', null));
});

it('sends every gallery photo in upload order', function (): void {
    Storage::fake('public');

    $spot = Spot::factory()->create(['name' => 'Gallery spot']);

    foreach (['first', 'second'] as $name) {
        $spot->addMedia(UploadedFile::fake()->image("{$name}.jpg", 20, 20))
            ->toMediaCollection('images');
    }

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('spots.0.images', 2)
            ->where('spots.0.images.0.url', fn (string $url): bool => str_contains($url, 'first'))
            ->where('spots.0.images.1.url', fn (string $url): bool => str_contains($url, 'second')));
});
