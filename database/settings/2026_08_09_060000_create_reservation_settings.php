<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->inGroup('reservation', function ($blueprint): void {
            $blueprint->add('is_active', true);
            $blueprint->add('phone_number', '+96171387946');
            $blueprint->add('map_is_active', false);
            $blueprint->add('map_image', null);
        });
    }

    public function down(): void
    {
        $this->migrator->inGroup('reservation', function ($blueprint): void {
            $blueprint->deleteIfExists('map_image');
            $blueprint->deleteIfExists('map_is_active');
            $blueprint->deleteIfExists('phone_number');
            $blueprint->deleteIfExists('is_active');
        });
    }
};
