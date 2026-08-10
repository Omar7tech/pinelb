<?php

namespace App\Settings;

use App\Enums\PriceDisplay;
use App\Enums\ShopStatusMode;
use App\Enums\Weekday;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Spatie\LaravelSettings\Settings;
use Spatie\LaravelSettings\SettingsCasts\EnumCast;

class GeneralSettings extends Settings
{
    /**
     * How the shop's open/closed state is decided: by hand (`MANUAL`) or from
     * the weekly {@see self::$opening_hours} schedule (`AUTOMATIC`).
     */
    public ShopStatusMode $status_mode;

    /**
     * The manual open/closed switch. Only authoritative when the status mode is
     * `MANUAL`; it gates ordering and drives the storefront's closed notice.
     */
    public bool $is_open;

    /**
     * The weekly opening-hours schedule used when the status mode is `AUTOMATIC`.
     * One entry per weekday, keyed by JS-style day number (0 = Sunday). Each entry
     * is shaped `['day' => int, 'is_closed' => bool, 'opens_at' => string, 'closes_at' => string]`.
     *
     * Note: no `@var` value type is declared because spatie/laravel-settings
     * cannot resolve a complex array-shape docblock here (it throws at runtime).
     */
    public array $opening_hours; // @phpstan-ignore missingType.iterableValue

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
            'status_mode' => new EnumCast(ShopStatusMode::class),
            'price_display' => new EnumCast(PriceDisplay::class),
        ];
    }

    /**
     * The default weekly schedule: every day open from 09:00 to 17:00. Used as
     * the baseline both when seeding the settings and when resetting them.
     *
     * @return array<int, array{day: int, is_closed: bool, opens_at: string, closes_at: string}>
     */
    public static function defaultOpeningHours(): array
    {
        return array_map(static fn (Weekday $day): array => [
            'day' => $day->value,
            'is_closed' => false,
            'opens_at' => '09:00',
            'closes_at' => '17:00',
        ], Weekday::cases());
    }

    /**
     * Whether the shop is open right now, resolving the active status mode.
     */
    public function isCurrentlyOpen(?CarbonInterface $now = null): bool
    {
        if ($this->status_mode === ShopStatusMode::MANUAL) {
            return $this->is_open;
        }

        return $this->isWithinSchedule($now ?? Carbon::now());
    }

    /**
     * Whether the given moment falls inside the weekly schedule. Yesterday's
     * hours are checked too, because a closing time at or before the opening
     * time runs past midnight (e.g. open 18:00, close 02:00) and keeps the shop
     * open into the small hours of the next day.
     */
    protected function isWithinSchedule(CarbonInterface $now): bool
    {
        return $this->isWithinDay($now, $now->copy()->startOfDay())
            || $this->isWithinDay($now, $now->copy()->subDay()->startOfDay());
    }

    /**
     * Whether the given moment falls inside the opening hours of `$day`, whose
     * session may end after midnight.
     */
    protected function isWithinDay(CarbonInterface $now, CarbonInterface $day): bool
    {
        // Malformed rows are dropped first: `data_get()` reads null off a
        // non-array row, and `null == 0` would otherwise match it on Sundays.
        $hours = collect($this->opening_hours)
            ->filter(fn (mixed $entry): bool => is_array($entry))
            ->firstWhere('day', $day->dayOfWeek);

        if ($hours === null || ($hours['is_closed'] ?? false)) {
            return false;
        }

        if (blank($hours['opens_at'] ?? null) || blank($hours['closes_at'] ?? null)) {
            return false;
        }

        $opensAt = $day->copy()->setTimeFromTimeString($hours['opens_at']);
        $closesAt = $day->copy()->setTimeFromTimeString($hours['closes_at']);

        if ($closesAt->lessThanOrEqualTo($opensAt)) {
            $closesAt->addDay();
        }

        return $now->betweenIncluded($opensAt, $closesAt);
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
