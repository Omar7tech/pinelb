<?php

use App\Enums\OrderType;
use App\Models\Category;
use App\Models\Product;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(MenuSeeder::class);
});

it('seeds every category and product', function (): void {
    expect(Category::count())->toBe(16)
        ->and(Product::count())->toBe(63)
        ->and(Product::whereNull('description')->orWhere('description', '')->count())->toBe(0)
        ->and(Product::pluck('slug')->unique())->toHaveCount(63)
        ->and(Product::where('order_type', OrderType::BOTH)->count())->toBe(63);
});

it('keeps the two dishes that share a name apart', function (): void {
    $duplicates = Product::where('title', 'Turkey & Cheese')->get();

    expect($duplicates)->toHaveCount(2)
        ->and($duplicates->pluck('slug')->all())
        ->toEqualCanonicalizing(['turkey-cheese', 'cold-sandwiches-turkey-cheese']);
});

it('stores add-ons on the dessert categories only', function (): void {
    $withAddons = Category::whereNotNull('addons')->pluck('title');

    expect($withAddons->all())->toEqualCanonicalizing([
        'Crepes',
        'Waffles',
        'Pancakes',
    ])->and(Category::where('title', 'Crepes')->value('addons'))->toHaveCount(10);
});

it('stores matte as one product with its four variants', function (): void {
    $matte = Product::where('title', 'Matte')->sole();

    expect($matte->variants)->toHaveCount(4)
        ->and($matte->variants[0]['name'])->toBe('Regular')
        ->and($matte->variants[0]['price'])->toBe(0)
        ->and($matte->variants[1]['name'])->toBe('بالحليب');
});

it('gives the arabic drink a readable slug', function (): void {
    expect(Product::where('title', 'سحلب')->value('slug'))->toBe('sahlab');
});

it('can run twice without duplicating anything', function (): void {
    $this->seed(MenuSeeder::class);

    expect(Category::count())->toBe(16)
        ->and(Product::count())->toBe(63);
});
