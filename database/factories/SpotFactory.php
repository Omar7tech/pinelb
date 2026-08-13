<?php

namespace Database\Factories;

use App\Models\Spot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Spot>
 */
class SpotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'is_active' => true,
            'is_reserved' => false,
            'sort_order' => 0,
            'price' => fake()->randomFloat(2, 5, 60),
            'discount_price' => null,
            'map_x' => null,
            'map_y' => null,
            'pin_color' => null,
        ];
    }

    /**
     * A spot pinned to the map, at the given percentage of its width and height.
     */
    public function placedAt(float $x = 50, float $y = 50): static
    {
        return $this->state(fn (): array => ['map_x' => $x, 'map_y' => $y]);
    }

    /**
     * A spot whose pin is drawn in its own colour rather than the defaults.
     */
    public function pinColored(string $pinColor = '#3b82f6'): static
    {
        return $this->state(fn (): array => ['pin_color' => $pinColor]);
    }

    /**
     * A spot that is hidden from the storefront.
     */
    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    /**
     * A spot already taken, shown on its card but not bookable.
     */
    public function reserved(): static
    {
        return $this->state(fn (): array => ['is_reserved' => true]);
    }

    /**
     * A spot offered below its usual price.
     */
    public function discounted(float $discountPrice = 10): static
    {
        return $this->state(fn (): array => [
            'price' => max($discountPrice * 2, 20),
            'discount_price' => $discountPrice,
        ]);
    }
}
