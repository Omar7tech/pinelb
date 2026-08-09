<?php

namespace App\Filament\Resources\Spots\Schemas;

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
                        TextEntry::make('sort_order')->label('Sort order'),
                        TextEntry::make('description')
                            ->placeholder('-')
                            ->columnSpanFull(),
                    ]),

                Section::make('Pricing & status')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextEntry::make('price')->money('USD'),
                        TextEntry::make('discount_price')
                            ->label('Discount price')
                            ->money('USD')
                            ->placeholder('-'),
                        IconEntry::make('is_active')
                            ->label('Active')
                            ->boolean(),
                        IconEntry::make('is_reserved')
                            ->label('Reserved')
                            ->boolean(),
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
