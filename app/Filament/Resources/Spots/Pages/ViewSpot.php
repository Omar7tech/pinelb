<?php

namespace App\Filament\Resources\Spots\Pages;

use App\Filament\Resources\Spots\SpotResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewSpot extends ViewRecord
{
    protected static string $resource = SpotResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
