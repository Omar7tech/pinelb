<?php

use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Filament\Resources\Categories\Pages\ViewCategory;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Products\Pages\ViewProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Settings\GeneralSettings;
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

it('creates a category without any add-ons', function (): void {
    Livewire::test(CreateCategory::class)
        ->assertFormSet(['addons' => []])
        ->fillForm(['title' => 'Manakish'])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Category::where('title', 'Manakish')->value('addons'))->toBe([]);
});
