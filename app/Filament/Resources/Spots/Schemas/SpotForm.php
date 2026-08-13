<?php

namespace App\Filament\Resources\Spots\Schemas;

use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SpotForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Details')
                    ->description('Basic information about the spot.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false),
                        Toggle::make('is_reservable')
                            ->label('Bookable')
                            ->helperText('Turn off for a landmark customers only read the map by — the parking, the WC, the playground. It keeps its pin and name, and drops everything about booking.')
                            ->default(true)
                            ->columnSpanFull()
                            ->inline(false),
                        Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Section::make('Photos')
                    ->description('The gallery shown on the spot card. Drag to reorder; the first photo leads.')
                    ->columnSpanFull()
                    ->components([
                        SpatieMediaLibraryFileUpload::make('images')
                            ->hiddenLabel()
                            ->collection('images')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->appendFiles()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(5120)
                            ->conversion('webp')
                            ->responsiveImages()
                            ->imageEditor()
                            ->panelLayout('grid')
                            ->columnSpanFull(),
                    ]),

                // Everything about booking, which a landmark has no use for.
                Section::make('Pricing & status')
                    ->columnSpanFull()
                    ->columns(2)
                    ->visibleJs(<<<'JS'
                        $get('is_reservable')
                        JS)
                    ->components([
                        TextInput::make('price')
                            ->helperText('Leave empty to list the spot without a price.')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('$'),
                        TextInput::make('discount_price')
                            ->numeric()
                            ->minValue(0)
                            ->lte('price')
                            ->prefix('$')
                            ->visibleJs(<<<'JS'
                                $get('price')
                                JS),
                        Toggle::make('is_reserved')
                            ->label('Reserved')
                            ->helperText('The spot stays on the page but is marked as already taken.')
                            ->default(false)
                            ->columnSpanFull()
                            ->inline(false),
                    ]),

                Section::make('Map pin')
                    ->description('How this spot is drawn on the floor plan. Place it from Reservations → Spot map.')
                    ->columnSpanFull()
                    ->components([
                        ColorPicker::make('pin_color')
                            ->label('Pin colour')
                            ->helperText('Leave empty to keep the default colours — sage while the spot is free, brick once it\'s reserved, slate for a landmark.')
                            ->hex()
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
