<?php

namespace App\Http\Middleware;

use App\Enums\SocialPlatform;
use App\Settings\GeneralSettings;
use App\Settings\ReservationSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(GeneralSettings::class);
        $reservations = app(ReservationSettings::class);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'banner' => [
                'show' => $settings->show_banner && filled($settings->banner_text),
                'text' => $settings->banner_text,
            ],
            'shop' => [
                // The authoritative open/closed snapshot for this request, used
                // for the first render; the client recomputes it live while the
                // shop runs on the automatic schedule.
                'isOpen' => $settings->isCurrentlyOpen(),
                'statusMode' => $settings->status_mode->value,
                'isManuallyOpen' => $settings->is_open,
                'openingHours' => $this->openingHours($settings),
            ],
            'pricing' => [
                'display' => $settings->resolvedPriceDisplay()->value,
                'lbpRate' => $settings->usableLbpRate(),
                'deliveryFeeUsd' => $settings->deliveryFeeUsd(),
            ],
            // What the customer has to provide before an order can be sent.
            'checkout' => [
                'requireFullName' => $settings->require_full_name,
                'requirePhoneNumber' => $settings->require_phone_number,
                'getClientLocation' => $settings->get_client_location,
            ],
            // Whether the delivery menu is available; when off the storefront is
            // dine-in only and the delivery route redirects back to dine-in.
            'onlineOrderingActive' => $settings->online_ordering_active,
            // Whether spots can be booked; when off the landing page's
            // reservation button is disabled and /spots redirects home.
            'reservations' => [
                'active' => $reservations->is_active,
                'phoneNumber' => $reservations->usablePhoneNumber(),
            ],
            'whatsappNumber' => $settings->online_ordering_active ? $settings->whatsapp_number : null,
            'whatsappBadge' => [
                'show' => $settings->show_whatsapp_badge && filled($settings->whatsapp_badge_number),
                'number' => $settings->whatsapp_badge_number,
            ],
            'socials' => $this->socialLinks($settings),
        ];
    }

    /**
     * The weekly schedule in the shape the storefront reads, dropping any entry
     * that isn't a complete day so a malformed row can't break the menu.
     *
     * @return array<int, array{day: int, isClosed: bool, opensAt: string, closesAt: string}>
     */
    private function openingHours(GeneralSettings $settings): array
    {
        return collect($settings->opening_hours)
            ->map(function (mixed $hours): ?array {
                if (! is_array($hours) || ! isset($hours['day'], $hours['opens_at'], $hours['closes_at'])) {
                    return null;
                }

                return [
                    'day' => (int) $hours['day'],
                    'isClosed' => (bool) ($hours['is_closed'] ?? false),
                    'opensAt' => (string) $hours['opens_at'],
                    'closesAt' => (string) $hours['closes_at'],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * The configured footer social links, dropping any entry whose platform is
     * unknown or whose URL is empty.
     *
     * @return array<int, array{platform: string, label: string, url: string, icon: string}>
     */
    private function socialLinks(GeneralSettings $settings): array
    {
        return collect($settings->social_links)
            ->map(function (mixed $link): ?array {
                if (! is_array($link)) {
                    return null;
                }

                $raw = $link['platform'] ?? null;
                $platform = $raw instanceof SocialPlatform ? $raw : SocialPlatform::tryFrom((string) $raw);
                $url = $link['url'] ?? null;

                if ($platform === null || blank($url)) {
                    return null;
                }

                return [
                    'platform' => $platform->value,
                    'label' => $platform->getLabel(),
                    'url' => (string) $url,
                    'icon' => $platform->getIconPath(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
