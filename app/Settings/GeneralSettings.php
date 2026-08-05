<?php

namespace App\Settings;

use App\Enums\PriceDisplay;
use Spatie\LaravelSettings\Settings;
use Spatie\LaravelSettings\SettingsCasts\EnumCast;

class GeneralSettings extends Settings
{
    /**
     * Whether a promotional strip is shown above the storefront header.
     */
    public bool $show_banner;

    /**
     * The sentence shown in the promotional strip.
     */
    public ?string $banner_text;

    /**
     * Whether prices may be displayed in Lebanese Pounds. When off, the
     * storefront falls back to USD regardless of {@see self::$price_display}.
     */
    public bool $show_lbp_prices;

    /**
     * How many LBP one USD is worth, used to convert every menu price.
     */
    public ?float $lbp_exchange_rate;

    /**
     * Which currency the storefront menu prices are rendered in.
     */
    public PriceDisplay $price_display;

    /**
     * Whether the delivery menu is available. When off the storefront is
     * dine-in only and `/menu/delivery` redirects back to the dine-in menu.
     */
    public bool $online_ordering_active;

    /**
     * The WhatsApp number delivery orders are sent to.
     */
    public ?string $whatsapp_number;

    /**
     * Whether a delivery charge is added to the order total.
     */
    public bool $charge_delivery;

    /**
     * The delivery charge in USD, applied when {@see self::$charge_delivery} is on.
     */
    public ?float $delivery_fee;

    /**
     * Whether the customer must give their name before sending an order.
     */
    public bool $require_full_name;

    /**
     * Whether the customer must give their phone number before sending an order.
     */
    public bool $require_phone_number;

    /**
     * Whether the customer's location is requested and attached to the order.
     */
    public bool $get_client_location;

    /**
     * Whether the floating WhatsApp chat button is shown on the storefront.
     */
    public bool $show_whatsapp_badge;

    /**
     * The WhatsApp number the floating chat button messages.
     */
    public ?string $whatsapp_badge_number;

    /**
     * The social links shown in the storefront footer. Each entry is shaped
     * `['platform' => string, 'url' => string]`, and a platform appears once.
     *
     * Note: no `@var` value type is declared because spatie/laravel-settings
     * cannot resolve a complex array-shape docblock here (it throws at runtime).
     */
    public array $social_links; // @phpstan-ignore missingType.iterableValue

    public static function group(): string
    {
        return 'general';
    }

    /**
     * @return array<string, EnumCast>
     */
    public static function casts(): array
    {
        return [
            'price_display' => new EnumCast(PriceDisplay::class),
        ];
    }

    /**
     * The LBP rate to price with, or null when LBP pricing is unusable (turned
     * off, or missing a positive rate).
     */
    public function usableLbpRate(): ?float
    {
        $rate = (float) $this->lbp_exchange_rate;

        return $this->show_lbp_prices && $rate > 0 ? $rate : null;
    }

    /**
     * The delivery charge to add to an order, or null when none applies —
     * either the charge is off or no positive fee is configured.
     */
    public function deliveryFeeUsd(): ?float
    {
        $fee = (float) $this->delivery_fee;

        return $this->charge_delivery && $fee > 0 ? $fee : null;
    }

    /**
     * The price display to actually render with, falling back to USD whenever
     * the chosen mode needs an LBP rate that isn't available.
     */
    public function resolvedPriceDisplay(): PriceDisplay
    {
        if ($this->price_display->needsLbpRate() && $this->usableLbpRate() === null) {
            return PriceDisplay::USD;
        }

        return $this->price_display;
    }
}
