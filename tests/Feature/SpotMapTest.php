<?php

use App\Filament\Pages\ManageReservations;
use App\Filament\Pages\SpotMap;
use App\Filament\Resources\Spots\Pages\EditSpot;
use App\Models\Spot;
use App\Models\User;
use App\Settings\ReservationSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Livewire\Livewire;

uses(RefreshDatabase::class);

/**
 * Apply the given values to the reservation settings and persist them.
 *
 * @param  array<string, mixed>  $values
 */
function mapSettings(array $values): ReservationSettings
{
    $settings = app(ReservationSettings::class);

    foreach ($values as $key => $value) {
        $settings->{$key} = $value;
    }

    $settings->save();

    return $settings;
}

it('withholds the map while it is switched off', function (): void {
    mapSettings(['map_is_active' => false, 'map_image' => 'spot-map/plan.png']);
    Spot::factory()->placedAt(20, 30)->create();

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('mapImage', null));
});

it('withholds the map while no image is uploaded', function (): void {
    mapSettings(['map_is_active' => true, 'map_image' => null]);
    Spot::factory()->create();

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('mapImage', null));
});

it('sends the map image and pin positions once the map is on', function (): void {
    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);
    Spot::factory()->placedAt(12.5, 74.25)->create(['name' => 'Pinned']);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('mapImage', Storage::disk('public')->url('spot-map/plan.png'))
            ->where('spots.0.map_x', 12.5)
            ->where('spots.0.map_y', 74.25));
});

it('sends null coordinates for a spot that is not on the map', function (): void {
    Spot::factory()->create(['name' => 'Unplaced']);

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('spots.0.map_x', null)
            ->where('spots.0.map_y', null));
});

it('sends the chosen pin colour with the spot', function (): void {
    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);
    Spot::factory()->placedAt()->pinColored('#3b82f6')->create();

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('spots.0.pin_color', '#3b82f6'));
});

it('sends a null pin colour for a spot left on the default tones', function (): void {
    Spot::factory()->placedAt()->create();

    $this->get(route('spots.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('spots.0.pin_color', null));
});

it('saves a pin colour chosen on the spot', function (): void {
    $this->actingAs(User::factory()->create());

    $spot = Spot::factory()->create();

    Livewire::test(EditSpot::class, ['record' => $spot->getRouteKey()])
        ->fillForm(['pin_color' => '#3b82f6'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($spot->fresh()->pin_color)->toBe('#3b82f6');
});

it('hands the pin editor each spot\'s colour', function (): void {
    $this->actingAs(User::factory()->create());

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);
    Spot::factory()->placedAt()->pinColored('#3b82f6')->create();

    $spots = Livewire::test(SpotMap::class)->assertOk()->instance()->spots;

    expect($spots[0]['pin_color'])->toBe('#3b82f6');
});

it('tells the pin editor which spots are landmarks', function (): void {
    $this->actingAs(User::factory()->create());

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);
    Spot::factory()->landmark()->create(['name' => 'WC']);

    $page = Livewire::test(SpotMap::class)
        ->assertOk()
        // The colour key sits under the plan, so a pin is read without
        // opening the spot behind it.
        ->assertSee('Landmark');

    expect($page->instance()->spots[0]['is_reservable'])->toBeFalse();
});

it('renders the pin editor with its spots and saved pins', function (): void {
    $this->actingAs(User::factory()->create());

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);
    $placed = Spot::factory()->placedAt(40, 60)->create(['name' => 'Fireplace']);
    Spot::factory()->create(['name' => 'Terrace']);

    // The pins are handed to the browser inside the editor's state, so the
    // names ride along in the markup rather than as rendered text.
    $page = Livewire::test(SpotMap::class)
        ->assertOk()
        ->assertSee('Fireplace')
        ->assertSee('Terrace');

    expect($page->instance()->positions)
        ->toBe([$placed->id => ['x' => 40.0, 'y' => 60.0]])
        ->and($page->instance()->mapImageUrl)
        ->toBe(Storage::disk('public')->url('spot-map/plan.png'));
});

it('saves the arranged layout and clears the pins left off it', function (): void {
    $this->actingAs(User::factory()->create());

    $moved = Spot::factory()->placedAt(10, 10)->create();
    $cleared = Spot::factory()->placedAt(80, 80)->create();
    $added = Spot::factory()->create();

    Livewire::test(SpotMap::class)
        ->call('saveLayout', [
            $moved->id => ['x' => 25.5, 'y' => 33.25],
            $added->id => ['x' => 90, 'y' => 5],
        ])
        ->assertHasNoErrors();

    expect((float) $moved->fresh()->map_x)->toBe(25.5)
        ->and((float) $moved->fresh()->map_y)->toBe(33.25)
        ->and((float) $added->fresh()->map_x)->toBe(90.0)
        ->and($cleared->fresh()->map_x)->toBeNull()
        ->and($cleared->fresh()->map_y)->toBeNull();
});

it('leaves the slugs alone when the layout is saved', function (): void {
    $this->actingAs(User::factory()->create());

    $placed = Spot::factory()->create(['name' => 'Fireplace']);
    $untouched = Spot::factory()->placedAt(80, 80)->create(['name' => 'Terrace']);

    Livewire::test(SpotMap::class)
        ->call('saveLayout', [$placed->id => ['x' => 25.5, 'y' => 33.25]])
        ->assertHasNoErrors();

    expect($placed->fresh()->slug)->toBe('fireplace')
        ->and($untouched->fresh()->slug)->toBe('terrace');
});

it('rejects a pin placed outside the map', function (): void {
    $this->actingAs(User::factory()->create());

    $spot = Spot::factory()->placedAt(10, 10)->create();

    Livewire::test(SpotMap::class)
        ->call('saveLayout', [$spot->id => ['x' => 140, 'y' => 10]])
        ->assertHasErrors();

    expect((float) $spot->fresh()->map_x)->toBe(10.0);
});

it('saves the map settings from the reservation page', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => '+96171387946',
            'map_is_active' => false,
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(app(ReservationSettings::class)->refresh()->map_is_active)->toBeFalse();
});

it('deletes the map image it replaces', function (): void {
    $this->actingAs(User::factory()->create());
    Storage::fake('public');
    Storage::disk('public')->put('spot-map/old.png', 'old');

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/old.png']);

    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => '+96171387946',
            'map_is_active' => true,
            'map_image' => [UploadedFile::fake()->image('new.png')],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $saved = app(ReservationSettings::class)->refresh()->map_image;

    Storage::disk('public')->assertMissing('spot-map/old.png');
    expect($saved)->not->toBe('spot-map/old.png');
    Storage::disk('public')->assertExists($saved);
});

it('deletes the map image when it is cleared', function (): void {
    $this->actingAs(User::factory()->create());
    Storage::fake('public');
    Storage::disk('public')->put('spot-map/old.png', 'old');

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/old.png']);

    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => '+96171387946',
            'map_is_active' => false,
            'map_image' => null,
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    Storage::disk('public')->assertMissing('spot-map/old.png');
});

it('keeps the map image when the settings are saved unchanged', function (): void {
    $this->actingAs(User::factory()->create());
    Storage::fake('public');
    Storage::disk('public')->put('spot-map/plan.png', 'plan');

    mapSettings(['map_is_active' => true, 'map_image' => 'spot-map/plan.png']);

    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => '+96171387946',
            'map_is_active' => true,
            'map_image' => ['plan' => 'spot-map/plan.png'],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    Storage::disk('public')->assertExists('spot-map/plan.png');
});

it('requires a map image while the map view is enabled', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => '+96171387946',
            'map_is_active' => true,
            'map_image' => null,
        ])
        ->call('save')
        ->assertHasFormErrors(['map_image']);
});
