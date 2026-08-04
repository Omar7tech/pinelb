<?php

namespace Database\Seeders;

use App\Enums\OrderType;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $usedSlugs = [];

        foreach ($this->menu() as $categorySortOrder => $category) {
            $record = Category::updateOrCreate(
                ['title' => $category['title']],
                [
                    'slug' => Str::slug($category['title']),
                    'is_active' => true,
                    'sort_order' => $categorySortOrder,
                    'addons' => $category['addons'] ?? null,
                ],
            );

            foreach ($category['products'] as $productSortOrder => $product) {
                $slug = $product['slug'] ?? Str::slug($product['title']);

                // A handful of dishes share a name across sections, so the
                // section qualifies the slug for whichever one lands second.
                if (in_array($slug, $usedSlugs, true)) {
                    $slug = Str::slug("{$category['title']} {$product['title']}");
                }

                $usedSlugs[] = $slug;

                $record->products()->updateOrCreate(
                    ['title' => $product['title']],
                    [
                        'slug' => $slug,
                        'description' => $product['description'],
                        'price' => $product['price'],
                        'order_type' => OrderType::BOTH,
                        'is_active' => true,
                        'is_featured' => $product['is_featured'] ?? false,
                        'sort_order' => $productSortOrder,
                        'variants' => $product['variants'] ?? [],
                    ],
                );
            }
        }
    }

    /**
     * The full PINE menu, in the order it should appear.
     *
     * Descriptions that the printed menu leaves blank are written here so every
     * dish reads consistently in the app.
     *
     * @return list<array{
     *     title: string,
     *     addons?: list<array{name: string, price: float}>,
     *     products: list<array{
     *         title: string,
     *         description: string,
     *         price: float,
     *         slug?: string,
     *         is_featured?: bool,
     *         variants?: list<array{name: string, price: float, discount_price: null}>,
     *     }>,
     * }>
     */
    private function menu(): array
    {
        $sweetAddons = [
            ['name' => 'Fruits', 'price' => 2],
            ['name' => 'M&Ms', 'price' => 1],
            ['name' => 'Nutella', 'price' => 1.5],
            ['name' => 'Lotus', 'price' => 1.5],
            ['name' => 'Kinder / Bueno', 'price' => 1.5],
            ['name' => "Hershey's", 'price' => 1.5],
            ['name' => 'Oreo', 'price' => 1],
            ['name' => 'KitKat', 'price' => 1.5],
            ['name' => 'White Chocolate', 'price' => 2],
            ['name' => 'Belgium Chocolate', 'price' => 2],
        ];

        return [
            [
                'title' => 'Crepes',
                'addons' => $sweetAddons,
                'products' => [
                    [
                        'title' => 'Classic Nutella',
                        'description' => 'Warm crepe folded over rich Nutella.',
                        'price' => 5,
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'Classic Lotus',
                        'description' => 'Warm crepe with smooth Lotus spread.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Classic Kinder',
                        'description' => 'Warm crepe filled with creamy Kinder chocolate.',
                        'price' => 5,
                    ],
                    [
                        'title' => "Classic Hershey's",
                        'description' => "Warm crepe drizzled with Hershey's chocolate.",
                        'price' => 5,
                    ],
                ],
            ],
            [
                'title' => 'Waffles',
                'addons' => $sweetAddons,
                'products' => [
                    [
                        'title' => 'Chocolate Waffle',
                        'description' => 'Crisp waffle under warm milk chocolate.',
                        'price' => 4,
                    ],
                    [
                        'title' => 'White Waffle',
                        'description' => 'Crisp waffle under warm white chocolate.',
                        'price' => 4,
                    ],
                ],
            ],
            [
                'title' => 'Pancakes',
                'addons' => $sweetAddons,
                'products' => [
                    [
                        'title' => 'Regular Pancake',
                        'description' => 'A stack of fluffy pancakes, syrup on the side.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Mini Pancake (8pcs)',
                        'description' => 'Eight bite-sized pancakes, made for sharing.',
                        'price' => 7.5,
                    ],
                ],
            ],
            [
                'title' => 'Saj',
                'products' => [
                    [
                        'title' => 'Pine',
                        'description' => 'Our house saj wrap — the one to start with.',
                        'price' => 4,
                        'is_featured' => true,
                    ],
                    [
                        'title' => '4 Cheese',
                        'description' => 'Four melted cheeses on hot saj bread.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Zaatar',
                        'description' => 'Zaatar and olive oil, baked on the saj.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Kishk',
                        'description' => 'Traditional kishk, baked until golden.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Turkey & Cheese',
                        'description' => 'Turkey and melted cheese, rolled on saj.',
                        'price' => 5,
                    ],
                ],
            ],
            [
                'title' => 'Appetizers',
                'products' => [
                    [
                        'title' => 'Loaded Fries',
                        'description' => 'Fries loaded with cheese sauce and toppings.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Crispy Loaded Fries',
                        'description' => 'Loaded fries topped with crispy chicken strips.',
                        'price' => 7,
                    ],
                    [
                        'title' => 'Mozarella Sticks (5pcs)',
                        'description' => 'Five golden sticks with a molten centre.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'Nuggets (5pcs)',
                        'description' => 'Five crispy chicken nuggets.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'Wings (6pcs)',
                        'description' => 'Six chicken wings, fried to order.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Chicken Popcorn',
                        'description' => 'Bite-sized crispy chicken, easy to share.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'French Fries',
                        'description' => 'Golden fries, salted and served hot.',
                        'price' => 3,
                    ],
                ],
            ],
            [
                'title' => 'Cold Sandwiches',
                'products' => [
                    [
                        'title' => 'Salmon Sandwich',
                        'description' => 'Multigrain bread, creamy cheese, smoked salmon, capers, dill',
                        'price' => 9,
                    ],
                    [
                        'title' => 'Halloumi Pesto',
                        'description' => 'Grilled halloumi, sun-dried tomatoes, lettuce, pesto',
                        'price' => 6,
                    ],
                    [
                        'title' => 'Turkey & Cheese',
                        'description' => 'White cheddar cheese, turkey, cornichon pickles, tomato, lettuce, mayo, mustard',
                        'price' => 6,
                    ],
                ],
            ],
            [
                'title' => 'Salads',
                'products' => [
                    [
                        'title' => 'Pine Salad',
                        'description' => 'Lettuce, dried cranberries, pine, walnut, pine sauce',
                        'price' => 8,
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'Crab Salad',
                        'description' => 'Crab, carrot, lettuce, avocado slices, orange slices, mango slices, crab dressing',
                        'price' => 7,
                    ],
                    [
                        'title' => 'Chicken Caesar Salad',
                        'description' => 'Lettuce, chicken, croutons, parmesan cheese, Caesar dressing',
                        'price' => 7,
                    ],
                ],
            ],
            [
                'title' => 'Kids Meal',
                'products' => [
                    [
                        'title' => 'Mini Burgers',
                        'description' => '2 mini burgers, fries, ketchup',
                        'price' => 7,
                    ],
                    [
                        'title' => 'Cocktail Meal',
                        'description' => '1 mini burger, 2 nuggets, 1 crispy strip, fries, ketchup',
                        'price' => 8,
                    ],
                    [
                        'title' => 'Crispy Meal',
                        'description' => '3 crispy strips, fries, ketchup, coleslaw',
                        'price' => 8,
                    ],
                ],
            ],
            [
                'title' => 'Burgers',
                'products' => [
                    [
                        'title' => 'Pine Burger',
                        'description' => 'Beef patty, mozzarella patty, grilled onion, grilled tomato, chips, lettuce, mayo',
                        'price' => 9.5,
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'Mushroom Burger',
                        'description' => 'Beef patty, emmental cheese, mushroom sauce, mayo',
                        'price' => 9,
                    ],
                    [
                        'title' => 'Cheese Burger',
                        'description' => 'Beef patty, mozzarella patty, emmental cheese, cheddar cheese, lettuce, mayo',
                        'price' => 9,
                    ],
                    [
                        'title' => 'Zinger Burger',
                        'description' => 'Fried chicken, mozzarella patty, mayo, cheddar, jalapeno, lettuce',
                        'price' => 7,
                    ],
                    [
                        'title' => 'Lebanese Burger',
                        'description' => 'Beef patty, coleslaw, fries, ketchup',
                        'price' => 6,
                    ],
                ],
            ],
            [
                'title' => 'Plates',
                'products' => [
                    [
                        'title' => 'Crispy Plate',
                        'description' => 'Crispy strips, fries, coleslaw, cheddar, bun',
                        'price' => 12,
                    ],
                    [
                        'title' => 'Grilled Chicken Plate',
                        'description' => 'Grilled chicken breast, fries, coleslaw, cocktail',
                        'price' => 13,
                    ],
                ],
            ],
            [
                'title' => 'Dips',
                'products' => [
                    [
                        'title' => 'BBQ',
                        'description' => 'Smoky barbecue dip.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Buffalo',
                        'description' => 'Tangy buffalo dip with a kick.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Cocktail',
                        'description' => 'Creamy cocktail dip.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Cheddar',
                        'description' => 'Warm cheddar cheese dip.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Mushroom',
                        'description' => 'Creamy mushroom dip.',
                        'price' => 0.5,
                    ],
                ],
            ],
            [
                'title' => 'Matte',
                'products' => [
                    [
                        'title' => 'Matte',
                        'description' => 'Traditional matte, served the way you like it.',
                        'price' => 0,
                        'variants' => [
                            ['name' => 'Regular', 'price' => 0, 'discount_price' => null],
                            ['name' => 'بالحليب', 'price' => 7, 'discount_price' => null],
                            ['name' => 'بالليموناضة', 'price' => 7, 'discount_price' => null],
                            ['name' => 'بالزهورات', 'price' => 6, 'discount_price' => null],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Soft Drinks',
                'products' => [
                    [
                        'title' => 'Pepsi / 7up / Mirinda',
                        'description' => 'Chilled soft drink.',
                        'price' => 1,
                    ],
                    [
                        'title' => 'Small Water',
                        'description' => 'Small bottle of still water.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Large Water',
                        'description' => 'Large bottle of still water.',
                        'price' => 1,
                    ],
                    [
                        'title' => 'Ice Tea',
                        'description' => 'Chilled iced tea.',
                        'price' => 1,
                    ],
                    [
                        'title' => 'Dark Blue',
                        'description' => 'Chilled energy drink.',
                        'price' => 1,
                    ],
                    [
                        'title' => 'Redbull',
                        'description' => 'Chilled energy drink.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Extra Juice',
                        'description' => 'Chilled fruit juice.',
                        'price' => 0.5,
                    ],
                    [
                        'title' => 'Maccaw',
                        'description' => 'Chilled fruit nectar.',
                        'price' => 0.5,
                    ],
                ],
            ],
            [
                'title' => 'Hot Drinks',
                'products' => [
                    [
                        'title' => 'Espresso',
                        'description' => 'A short, strong shot.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Americano',
                        'description' => 'Espresso lengthened with hot water.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'Coffee Rakwa',
                        'description' => 'Lebanese coffee brewed in the rakwa.',
                        'price' => 4,
                    ],
                    [
                        'title' => 'Spanish Latte',
                        'description' => 'Espresso with sweetened condensed milk.',
                        'price' => 5,
                    ],
                    [
                        'title' => 'Tea',
                        'description' => 'Freshly brewed tea.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Cappuccino',
                        'description' => 'Espresso under steamed milk foam.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'Nescafe 3 in 1',
                        'description' => 'Instant coffee, milk and sugar in one.',
                        'price' => 2,
                    ],
                    [
                        'title' => 'سحلب',
                        'slug' => 'sahlab',
                        'description' => 'Warm sahlab, topped with cinnamon and nuts.',
                        'price' => 3.5,
                    ],
                ],
            ],
            [
                'title' => 'Iced Drinks',
                'products' => [
                    [
                        'title' => 'Iced Americano',
                        'description' => 'Espresso over ice and cold water.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'Iced Latte',
                        'description' => 'Espresso over ice and cold milk.',
                        'price' => 4,
                    ],
                    [
                        'title' => 'Iced Spanish Latte',
                        'description' => 'Iced espresso with sweetened condensed milk.',
                        'price' => 5,
                    ],
                ],
            ],
            [
                'title' => 'Fresh Juices',
                'products' => [
                    [
                        'title' => 'Orange',
                        'description' => 'Freshly squeezed orange juice.',
                        'price' => 3,
                    ],
                    [
                        'title' => 'Carrot',
                        'description' => 'Freshly pressed carrot juice.',
                        'price' => 3,
                    ],
                ],
            ],
        ];
    }
}
