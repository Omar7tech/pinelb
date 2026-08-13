<?php

namespace App\Filament\Resources\Spots\Tables;

use App\Filament\Resources\Spots\Pages\ListSpots;
use App\Filament\Tables\Columns\PriceColumn;
use App\Settings\GeneralSettings;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SpotsTable
{
    public static function configure(Table $table): Table
    {
        // Null hides the LBP line, matching the storefront's fallback to USD.
        $lbpRate = app(GeneralSettings::class)->usableLbpRate();

        // The tabs already split the two kinds apart, so the booking columns
        // and filters are only worth showing on the side that books.
        $bookable = fn (ListSpots $livewire): bool => $livewire->activeTab !== 'landmarks';

        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                SpatieMediaLibraryImageColumn::make('images')
                    ->label('Photos')
                    ->collection('images')
                    ->conversion('thumb')
                    ->circular()
                    ->stacked()
                    ->limit(3),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                PriceColumn::make('price')
                    ->label('Price')
                    ->sortable()
                    ->lbpRate($lbpRate)
                    ->visible($bookable),
                ToggleColumn::make('is_active')
                    ->label('Active')
                    ->sortable(),
                ToggleColumn::make('is_reserved')
                    ->label('Reserved')
                    ->sortable()
                    ->visible($bookable),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_active')->label('Active'),
                TernaryFilter::make('is_reserved')
                    ->label('Reserved')
                    ->visible($bookable),
                TernaryFilter::make('discount_price')
                    ->label('Discount')
                    ->placeholder('All spots')
                    ->trueLabel('On discount')
                    ->falseLabel('Full price')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('discount_price'),
                        false: fn (Builder $query): Builder => $query->whereNull('discount_price'),
                        blank: fn (Builder $query): Builder => $query,
                    )
                    ->visible($bookable),
            ])
            ->filtersFormColumns(2)
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
