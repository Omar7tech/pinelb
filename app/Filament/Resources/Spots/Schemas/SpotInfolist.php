<?php

namespace App\Filament\Resources\Spots\Schemas;

use App\Models\Spot;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\SpatieMediaLibraryImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SpotInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        SpatieMediaLibraryImageEntry::make('images')
                            ->label('Photos')
                            ->collection('images')
                            ->conversion('thumb')
                            ->placeholder('-')
                            ->columnSpanFull(),
                        TextEntry::make('name'),
                        TextEntry::make('is_reservable')
                            ->label('Kind')
                            ->badge()
                            ->formatStateUsing(fn (bool $state): string => $state ? 'Bookable spot' : 'Landmark')
                            ->color(fn (bool $state): string => $state ? 'primary' : 'gray'),
                        TextEntry::make('sort_order')->label('Sort order'),
                        TextEntry::make('description')
                            ->placeholder('-')
                            ->columnSpanFull(),
                    ]),

                // A landmark is never booked, so its price and reservation say
                // nothing — the section is left with what it does have.
                Section::make('Pricing & status')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextEntry::make('price')
                            ->money('USD')
                            ->placeholder('On request')
                            ->visible(fn (Spot $record): bool => $record->is_reservable),
                        TextEntry::make('discount_price')
                            ->label('Discount price')
                            ->money('USD')
                            ->placeholder('-')
                            ->visible(fn (Spot $record): bool => $record->is_reservable),
                        IconEntry::make('is_active')
                            ->label('Active')
                            ->boolean(),
                        IconEntry::make('is_reserved')
                            ->label('Reserved')
                            ->boolean()
                            ->visible(fn (Spot $record): bool => $record->is_reservable),
                    ]),

                Section::make('Meta')
                    ->columnSpanFull()
                    ->columns(2)
                    ->collapsed()
                    ->components([
                        TextEntry::make('created_at')
                            ->dateTime()
                            ->placeholder('-'),
                        TextEntry::make('updated_at')
                            ->dateTime()
                            ->placeholder('-'),
                    ]),
            ]);
    }
}
