<?php

use App\Models\Spot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

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
