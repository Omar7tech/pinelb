<?php

namespace App\Filament\Resources\Spots\Pages;

use App\Filament\Resources\Spots\SpotResource;
use App\Models\Spot;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListSpots extends ListRecords
{
    protected static string $resource = SpotResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    /**
     * The two kinds of record the table holds: the spots customers book, and
     * the landmarks that only give the map its bearings.
     *
     * @return array<string, Tab>
     */
    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All')
                ->badge(Spot::query()->count()),

            'bookable' => Tab::make('Bookable')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('is_reservable', true))
                ->badge(Spot::query()->where('is_reservable', true)->count()),

            'landmarks' => Tab::make('Landmarks')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('is_reservable', false))
                ->badge(Spot::query()->where('is_reservable', false)->count()),
        ];
    }
}
