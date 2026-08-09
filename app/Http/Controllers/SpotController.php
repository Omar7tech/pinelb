<?php

namespace App\Http\Controllers;

use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Settings\GeneralSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SpotController extends Controller
{
    /**
     * The reservation page reached from the landing page's "احجز قعدتك" button:
     * every active spot as a card, in display order. Reserved spots stay on the
     * page so customers can see what the place offers — their card is just
     * marked as taken rather than bookable.
     */
    public function index(GeneralSettings $settings): Response|RedirectResponse
    {
        // The page only exists while reservations are being taken; otherwise
        // send customers back to the landing page, matching the disabled button.
        if (! $settings->reservations_active) {
            return redirect()->route('home');
        }

        $spots = Spot::query()
            ->where('is_active', true)
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('spots', [
            'spots' => SpotResource::collection($spots)->resolve(),
        ]);
    }
}
