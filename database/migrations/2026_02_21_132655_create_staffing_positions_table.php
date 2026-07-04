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
        Schema::create('staffing_positions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('campus', 255);
            $table->string('office', 255);
            $table->string('position', 255);
            $table->integer('sg');
            $table->string('status', 255)->default('Unfilled'); // Filled, Unfilled, On-process
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staffing_positions');
    }
};
