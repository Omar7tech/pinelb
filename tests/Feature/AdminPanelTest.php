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
