<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Where the spot's pin sits on the uploaded map, as a percentage of the
     * image's width and height. Percentages travel with the image whatever
     * size it is rendered at; a spot without a pin is left null.
     */
    public function up(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->decimal('map_x', 5, 2)->nullable()->after('discount_price');
            $table->decimal('map_y', 5, 2)->nullable()->after('map_x');
        });
    }

    public function down(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->dropColumn(['map_x', 'map_y']);
        });
    }
};
