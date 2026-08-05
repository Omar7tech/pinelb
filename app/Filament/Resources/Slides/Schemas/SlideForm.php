<?php

namespace App\Filament\Resources\Slides\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class SlideForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Slide')
                    ->description('A wide image for the menu carousel, with an optional product link.')
                    ->columnSpanFull()
                    ->columns(2)
                    ->components([
                        SpatieMediaLibraryFileUpload::make('image')
                            ->label('Image')
                            ->collection('image')
                            ->disk('public')
                            ->visibility('public')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(5120)
                            ->conversion('slider')
                            ->imageEditor()
                            ->imageEditorAspectRatios(['16:9', '21:9', '3:1'])
                            ->helperText('Use a wide image (16:9 works best).')
                            ->required()
                            ->columnSpanFull(),

                        TextInput::make('text')
                            ->label('Caption')
                            ->helperText('Optional text shown over the slide image.')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Select::make('product_id')
                            ->label('Links to product')
                            ->relationship('product', 'title', fn (Builder $query): Builder => $query->orderBy('sort_order'))
                            ->searchable()
                            ->preload()
                            ->placeholder('No link (plain image)')
                            ->helperText('Tapping the slide opens this product. Leave empty for a plain image.'),

                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false),
                    ]),
            ]);
    }
}
