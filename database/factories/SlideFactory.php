<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Slide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Slide>
 */
class SlideFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => null,
            'text' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    /**
     * A slide that opens the given product when tapped.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (): array => ['product_id' => $product->id]);
    }

    /**
     * A slide that is hidden from the storefront.
     */
    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
