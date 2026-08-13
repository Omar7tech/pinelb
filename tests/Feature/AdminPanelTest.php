<?php

use App\Filament\Pages\ManageReservations;
use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Filament\Resources\Categories\Pages\ViewCategory;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Products\Pages\ViewProduct;
use App\Filament\Resources\Spots\Pages\CreateSpot;
use App\Filament\Resources\Spots\Pages\EditSpot;
use App\Filament\Resources\Spots\Pages\ListSpots;
use App\Filament\Resources\Spots\Pages\ViewSpot;
use App\Models\Category;
use App\Models\Product;
use App\Models\Spot;
use App\Models\User;
use App\Settings\GeneralSettings;
use App\Settings\ReservationSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());

    $this->category = Category::create([
        'title' => 'Crepes',
        'addons' => [['name' => 'Extra cheese', 'price' => 1.5]],
    ]);

    $this->product = Product::create([
        'title' => 'Nutella crepe',
        'subtitle' => 'Sweet',
        'price' => 5.5,
        'discount_price' => 4.5,
        'category_id' => $this->category->id,
        'variants' => [['name' => 'Large', 'price' => 7]],
    ]);

    $this->spot = Spot::create([
        'name' => 'Garden corner',
        'description' => 'Under the pines.',
        'price' => 25,
    ]);
});

it('renders product pages', function (string $page): void {
    Livewire::test($page, in_array($page, [ViewProduct::class, EditProduct::class], true)
        ? ['record' => $this->product->getRouteKey()]
        : [])->assertOk();
})->with([ListProducts::class, CreateProduct::class, ViewProduct::class, EditProduct::class]);

it('renders category pages', function (string $page): void {
    Livewire::test($page, in_array($page, [ListCategories::class, CreateCategory::class], true)
        ? []
        : ['record' => $this->category->getRouteKey()])->assertOk();
})->with([ListCategories::class, CreateCategory::class, ViewCategory::class, EditCategory::class]);

it('lists a product price with its sale price and the LBP conversion', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->show_lbp_prices = true;
    $settings->lbp_exchange_rate = 90000;
    $settings->save();

    // The LBP line follows the effective price: 4.50 × 90,000 = 405,000.
    Livewire::test(ListProducts::class)
        ->assertSeeText('$5.50')
        ->assertSeeText('$4.50')
        ->assertSeeText('405,000 LBP');
});

it('lists a product price without LBP while LBP pricing is off', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->show_lbp_prices = false;
    $settings->lbp_exchange_rate = 90000;
    $settings->save();

    Livewire::test(ListProducts::class)
        ->assertSeeText('$5.50')
        ->assertDontSeeText('LBP');
});

it('creates and edits a product through the form', function (): void {
    Livewire::test(CreateProduct::class)
        ->fillForm([
            'title' => 'Cheese saj',
            'category_id' => $this->category->id,
            'price' => 3.25,
            'order_type' => 'both',
            'variants' => [['name' => 'Small', 'price' => 3, 'discount_price' => null]],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Livewire::test(EditProduct::class, ['record' => $this->product->getRouteKey()])
        ->fillForm(['title' => 'Updated crepe'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(Product::where('title', 'Cheese saj')->exists())->toBeTrue()
        ->and($this->product->fresh()->title)->toBe('Updated crepe');
});

it('creates a product without any variants', function (): void {
    Livewire::test(CreateProduct::class)
        ->assertFormSet(['variants' => []])
        ->fillForm([
            'title' => 'Zaatar saj',
            'category_id' => $this->category->id,
            'price' => 2,
            'order_type' => 'both',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Product::where('title', 'Zaatar saj')->value('variants'))->toBe([]);
});

it('keeps the sort order out of the product form and defaults it on create', function (): void {
    Livewire::test(CreateProduct::class)
        ->assertFormFieldDoesNotExist('sort_order')
        ->fillForm([
            'title' => 'Halloumi saj',
            'category_id' => $this->category->id,
            'price' => 4,
            'order_type' => 'both',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Product::where('title', 'Halloumi saj')->value('sort_order'))->toBe(0);

    Livewire::test(EditProduct::class, ['record' => $this->product->getRouteKey()])
        ->assertFormFieldDoesNotExist('sort_order');
});

it('renders spot pages', function (string $page): void {
    Livewire::test($page, in_array($page, [ListSpots::class, CreateSpot::class], true)
        ? []
        : ['record' => $this->spot->getRouteKey()])->assertOk();
})->with([ListSpots::class, CreateSpot::class, ViewSpot::class, EditSpot::class]);

it('creates and edits a spot through the form', function (): void {
    Livewire::test(CreateSpot::class)
        ->fillForm([
            'name' => 'Fireplace table',
            'description' => 'Beside the fire.',
            'price' => 40,
            'discount_price' => 30,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Livewire::test(EditSpot::class, ['record' => $this->spot->getRouteKey()])
        ->fillForm(['is_reserved' => true])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(Spot::where('name', 'Fireplace table')->value('slug'))->toBe('fireplace-table')
        ->and($this->spot->fresh()->is_reserved)->toBeTrue();
});

it('keeps the sort order out of the spot form and defaults it on create', function (): void {
    Livewire::test(CreateSpot::class)
        ->assertFormFieldDoesNotExist('sort_order')
        ->fillForm([
            'name' => 'Pine bench',
            'price' => 15,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Spot::where('name', 'Pine bench')->value('sort_order'))->toBe(0);

    Livewire::test(EditSpot::class, ['record' => $this->spot->getRouteKey()])
        ->assertFormFieldDoesNotExist('sort_order');
});

it('saves the reservation settings', function (): void {
    Livewire::test(ManageReservations::class)
        ->assertFormSet([
            'is_active' => true,
            'phone_number' => '+96171387946',
        ])
        ->fillForm(['phone_number' => '+9613000000'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect(app(ReservationSettings::class)->refresh()->phone_number)->toBe('+9613000000');
});

it('requires a reservation number while reservations are enabled', function (): void {
    Livewire::test(ManageReservations::class)
        ->fillForm([
            'is_active' => true,
            'phone_number' => null,
        ])
        ->call('save')
        ->assertHasFormErrors(['phone_number']);
});

it('creates a spot without a price', function (): void {
    Livewire::test(CreateSpot::class)
        ->fillForm([
            'name' => 'Quoted table',
            'price' => null,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Spot::where('name', 'Quoted table')->value('price'))->toBeNull();
});

it('keeps the booking entries off a landmark\'s view page', function (): void {
    $landmark = Spot::factory()->landmark()->create();

    Livewire::test(ViewSpot::class, ['record' => $landmark->getRouteKey()])
        ->assertOk()
        ->assertSee('Landmark')
        ->assertDontSee('Discount price')
        ->assertDontSee('Reserved');

    Livewire::test(ViewSpot::class, ['record' => $this->spot->getRouteKey()])
        ->assertOk()
        ->assertSee('Bookable spot')
        ->assertSee('Discount price')
        ->assertSee('Reserved');
});

it('creates a landmark that carries no price or reservation', function (): void {
    Livewire::test(CreateSpot::class)
        ->fillForm([
            'name' => 'Parking',
            'is_reservable' => false,
            'price' => 25,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Spot::where('name', 'Parking')->first())
        ->is_reservable->toBeFalse()
        ->price->toBeNull()
        ->is_reserved->toBeFalse();
});

it('splits the spot list into bookable spots and landmarks', function (): void {
    Spot::factory()->create(['name' => 'Fireplace table']);
    Spot::factory()->landmark()->create(['name' => 'Playground']);

    // The list opens on the spots customers book.
    Livewire::test(ListSpots::class)
        ->assertCanSeeTableRecords(Spot::where('is_reservable', true)->get())
        ->assertCanNotSeeTableRecords(Spot::where('is_reservable', false)->get())
        ->set('activeTab', 'landmarks')
        ->assertCanSeeTableRecords(Spot::where('is_reservable', false)->get())
        ->assertCanNotSeeTableRecords(Spot::where('is_reservable', true)->get());
});

it('rejects a spot discount above its price', function (): void {
    Livewire::test(CreateSpot::class)
        ->fillForm([
            'name' => 'Bad deal',
            'price' => 10,
            'discount_price' => 20,
        ])
        ->call('create')
        ->assertHasFormErrors(['discount_price']);
});

it('creates a category without any add-ons', function (): void {
    Livewire::test(CreateCategory::class)
        ->assertFormSet(['addons' => []])
        ->fillForm(['title' => 'Manakish'])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Category::where('title', 'Manakish')->value('addons'))->toBe([]);
});
