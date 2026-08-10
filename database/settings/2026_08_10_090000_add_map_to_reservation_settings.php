<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->inGroup('reservation', function ($blueprint): void {
            $blueprint->add('map_is_active', false);
            $blueprint->add('map_image', null);
        });
    }

    public function down(): void
    {
        $this->migrator->inGroup('reservation', function ($blueprint): void {
            $blueprint->deleteIfExists('map_image');
            $blueprint->deleteIfExists('map_is_active');
        });
    }
};
