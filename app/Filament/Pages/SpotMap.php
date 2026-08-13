<?php

namespace App\Filament\Pages;

use App\Models\Spot;
use App\Settings\ReservationSettings;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Livewire\Attributes\Computed;
use UnitEnum;

/**
 * The floor plan editor: the uploaded map with a draggable pin for every spot,
 * and a list of the spots still waiting to be placed. Positions are held in the
 * browser while the layout is arranged and written in one go on save.
 */
class SpotMap extends Page
{
    protected string $view = 'filament.pages.spot-map';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMapPin;

    protected static ?string $navigationLabel = 'Spot map';

    protected static ?string $title = 'Spot map';

    protected static string|UnitEnum|null $navigationGroup = 'Reservations';

    protected static ?int $navigationSort = 3;

    /**
     * Every spot, placed or not, in display order.
     *
     * @return array<int, array{id: int, name: string, is_active: bool, is_reserved: bool, pin_color: ?string}>
     */
    #[Computed]
    public function spots(): array
    {
        return Spot::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'is_active', 'is_reserved', 'pin_color'])
            ->map(fn (Spot $spot): array => [
                'id' => $spot->id,
                'name' => $spot->name,
                'is_active' => $spot->is_active,
                'is_reserved' => $spot->is_reserved,
                'pin_color' => $spot->pin_color,
            ])
            ->all();
    }

    /**
     * The pins already saved, keyed by spot id.
     *
     * @return array<int, array{x: float, y: float}>
     */
    #[Computed]
    public function positions(): array
    {
        return Spot::query()
            ->whereNotNull('map_x')
            ->whereNotNull('map_y')
            ->get(['id', 'map_x', 'map_y'])
            ->mapWithKeys(fn (Spot $spot): array => [
                $spot->id => ['x' => (float) $spot->map_x, 'y' => (float) $spot->map_y],
            ])
            ->all();
    }

    /**
     * The map image being arranged, or null while none is uploaded.
     */
    #[Computed]
    public function mapImageUrl(): ?string
    {
        $mapImage = app(ReservationSettings::class)->map_image;

        return blank($mapImage) ? null : Storage::disk('public')->url($mapImage);
    }

    /**
     * Whether the map view is switched on for customers. The layout can still
     * be arranged while it's off, it just isn't offered on the storefront yet.
     */
    #[Computed]
    public function mapIsActive(): bool
    {
        return app(ReservationSettings::class)->map_is_active;
    }

    /**
     * Persist the arranged layout: every spot in the payload gets its pin, and
     * every spot left out has its pin cleared.
     *
     * @param  array<int|string, array{x: mixed, y: mixed}>  $positions
     */
    public function saveLayout(array $positions): void
    {
        $validated = Validator::make(
            ['positions' => $positions],
            [
                'positions' => ['array'],
                'positions.*.x' => ['required', 'numeric', 'between:0,100'],
                'positions.*.y' => ['required', 'numeric', 'between:0,100'],
            ],
        )->validate()['positions'] ?? [];

        foreach (Spot::query()->get(['id']) as $spot) {
            $pin = $validated[$spot->id] ?? null;

            $spot->update([
                'map_x' => $pin === null ? null : round((float) $pin['x'], 2),
                'map_y' => $pin === null ? null : round((float) $pin['y'], 2),
            ]);
        }

        unset($this->positions);

        Notification::make()
            ->title('Map layout saved')
            ->success()
            ->send();
    }
}
