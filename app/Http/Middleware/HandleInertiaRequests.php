<?php

namespace App\Http\Middleware;

use App\Enums\SocialPlatform;
use App\Settings\GeneralSettings;
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
            'whatsappNumber' => $settings->online_ordering_active ? $settings->whatsapp_number : null,
            'whatsappBadge' => [
                'show' => $settings->show_whatsapp_badge && filled($settings->whatsapp_badge_number),
                'number' => $settings->whatsapp_badge_number,
            ],
            'socials' => $this->socialLinks($settings),
        ];
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
