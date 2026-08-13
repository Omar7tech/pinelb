<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The colour of the spot's pin on the map, as a `#rrggbb` string. Null
     * keeps the spot on the default tones — sage when it's free, brick once
     * it's taken.
     */
    public function up(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->string('pin_color', 7)->nullable()->after('map_y');
        });
    }

    public function down(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->dropColumn('pin_color');
        });
    }
};
