<?php

use App\Enums\OrderType;
use App\Models\Category;
use App\Models\Product;
use App\Models\Slide;
use App\Settings\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

/** Turn the delivery menu on so both order types are reachable by default. */
beforeEach(function (): void {
    $settings = app(GeneralSettings::class);
    $settings->online_ordering_active = true;
    $settings->save();
});

it('renders the dine-in menu with its categories and products', function (): void {
    $category = Category::factory()->create(['title' => 'Salads']);
    Product::factory()->for($category)->create(['title' => 'Rocket salad']);

    $this->get(route('menu.dine-in'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('menu')
            ->where('orderType', 'dine_in')
            ->where('orderTypeLabel', 'Dine in')
            ->has('categories', 1)
            ->where('categories.0.title', 'Salads')
            ->has('categories.0.products', 1)
            ->where('categories.0.products.0.title', 'Rocket salad'));
});

it('only lists products offered for the menu it renders', function (): void {
    $category = Category::factory()->create();

    Product::factory()->for($category)->orderType(OrderType::DINE_IN)->create(['title' => 'Table only']);
    Product::factory()->for($category)->orderType(OrderType::DELIVERY)->create(['title' => 'Delivery only']);
    Product::factory()->for($category)->orderType(OrderType::BOTH)->create(['title' => 'Always']);

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('categories.0.products', 2)
            ->where('categories.0.products.0.title', 'Table only')
            ->where('categories.0.products.1.title', 'Always'));

    $this->get(route('menu.delivery'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('categories.0.products', 2)
            ->where('categories.0.products.0.title', 'Delivery only')
            ->where('categories.0.products.1.title', 'Always'));
});

it('hides inactive categories and categories with no products for this menu', function (): void {
    Category::factory()->inactive()->create(['title' => 'Hidden'])
        ->products()->save(Product::factory()->make());

    Category::factory()->create(['title' => 'Delivery corner'])
        ->products()->save(Product::factory()->orderType(OrderType::DELIVERY)->make());

    Category::factory()->create(['title' => 'Mains'])
        ->products()->save(Product::factory()->make());

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('categories', 1)
            ->where('categories.0.title', 'Mains'));
});

it('hides inactive products', function (): void {
    $category = Category::factory()->create();
    Product::factory()->for($category)->create(['title' => 'Live']);
    Product::factory()->for($category)->inactive()->create(['title' => 'Retired']);

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('categories.0.products', 1)
            ->where('categories.0.products.0.title', 'Live'));
});

it('orders categories and products by their sort order', function (): void {
    $second = Category::factory()->create(['title' => 'Second', 'sort_order' => 2]);
    $first = Category::factory()->create(['title' => 'First', 'sort_order' => 1]);

    Product::factory()->for($first)->create(['title' => 'B', 'sort_order' => 2]);
    Product::factory()->for($first)->create(['title' => 'A', 'sort_order' => 1]);
    Product::factory()->for($second)->create();

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('categories.0.title', 'First')
            ->where('categories.1.title', 'Second')
            ->where('categories.0.products.0.title', 'A')
            ->where('categories.0.products.1.title', 'B'));
});

it('sends the active slides, keeping plain images and dropping unavailable links', function (): void {
    $category = Category::factory()->withAddons()->create();
    $dineIn = Product::factory()->for($category)->orderType(OrderType::DINE_IN)->create();
    $delivery = Product::factory()->for($category)->orderType(OrderType::DELIVERY)->create();

    Slide::factory()->create(['text' => 'Plain', 'sort_order' => 1]);
    Slide::factory()->forProduct($dineIn)->create(['sort_order' => 2]);
    Slide::factory()->forProduct($delivery)->create(['sort_order' => 3]);
    Slide::factory()->inactive()->create(['text' => 'Off', 'sort_order' => 4]);

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->has('slides', 2)
            ->where('slides.0.text', 'Plain')
            ->where('slides.0.product', null)
            ->where('slides.1.product.id', $dineIn->id)
            ->has('slides.1.addons', 2));
});

it('drops a slide whose linked product has been deactivated', function (): void {
    $product = Product::factory()->inactive()->create();
    Slide::factory()->forProduct($product)->create();

    $this->get(route('menu.dine-in'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page->has('slides', 0));
});

it('sends delivery customers back to dine-in while the delivery menu is off', function (): void {
    $settings = app(GeneralSettings::class);
    $settings->online_ordering_active = false;
    $settings->save();

    $this->get(route('menu.delivery'))->assertRedirect(route('menu.dine-in'));
});
