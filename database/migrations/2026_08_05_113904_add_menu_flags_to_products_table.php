<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedSmallInteger('preparation_time')->nullable()->after('description');
            $table->boolean('is_spicy')->default(false)->after('is_featured');
            $table->boolean('is_vegan')->default(false)->after('is_spicy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['preparation_time', 'is_spicy', 'is_vegan']);
        });
    }
};
