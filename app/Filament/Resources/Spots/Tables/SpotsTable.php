<?php

namespace App\Filament\Resources\Spots\Tables;

use App\Filament\Tables\Columns\PriceColumn;
use App\Models\Spot;
use App\Settings\GeneralSettings;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
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
                    ->lbpRate($lbpRate),
                IconColumn::make('is_reservable')
                    ->label('Bookable')
                    ->boolean()
                    ->trueIcon(Heroicon::OutlinedCalendarDays)
                    ->falseIcon(Heroicon::OutlinedMapPin)
                    ->falseColor('gray')
                    ->tooltip(fn (Spot $record): string => $record->is_reservable ? 'Bookable spot' : 'Landmark — map only')
                    ->sortable(),
                ToggleColumn::make('is_active')
                    ->label('Active')
                    ->sortable(),
                ToggleColumn::make('is_reserved')
                    ->label('Reserved')
                    // A landmark is never taken, so its toggle would say
                    // nothing.
                    ->disabled(fn (Spot $record): bool => ! $record->is_reservable)
                    ->sortable(),
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
                TernaryFilter::make('is_reservable')
                    ->label('Bookable')
                    ->placeholder('All spots')
                    ->trueLabel('Bookable spots')
                    ->falseLabel('Landmarks'),
                TernaryFilter::make('is_active')->label('Active'),
                TernaryFilter::make('is_reserved')->label('Reserved'),
                TernaryFilter::make('discount_price')
                    ->label('Discount')
                    ->placeholder('All spots')
                    ->trueLabel('On discount')
                    ->falseLabel('Full price')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNotNull('discount_price'),
                        false: fn (Builder $query): Builder => $query->whereNull('discount_price'),
                        blank: fn (Builder $query): Builder => $query,
                    ),
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
