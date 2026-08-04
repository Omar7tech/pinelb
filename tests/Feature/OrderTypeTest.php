<?php

use App\Enums\OrderType;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('offers dine in, delivery and both', function (): void {
    expect(array_column(OrderType::cases(), 'value'))
        ->toBe(['dine_in', 'delivery', 'both'])
        ->and(OrderType::DELIVERY->getLabel())->toBe('Delivery');
});

it('casts a stored delivery value back to the enum', function (): void {
    $product = Product::create([
        'title' => 'Zaatar saj',
        'price' => 2,
        'order_type' => OrderType::DELIVERY,
        'category_id' => Category::create(['title' => 'Saj'])->id,
    ]);

    expect($product->fresh()->order_type)->toBe(OrderType::DELIVERY)
        ->and(DB::table('products')->value('order_type'))->toBe('delivery');
});
