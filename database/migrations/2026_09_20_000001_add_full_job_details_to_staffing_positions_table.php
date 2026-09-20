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
        Schema::table('staffing_positions', function (Blueprint $table) {
            $table->string('plantilla_item', 255)->nullable()->after('position');
            $table->string('employment_type', 255)->default('Full-time')->after('plantilla_item');
            $table->string('location', 255)->nullable()->after('employment_type');
            $table->text('qs_education')->nullable()->after('location');
            $table->text('qs_experience')->nullable()->after('qs_education');
            $table->text('qs_eligibility')->nullable()->after('qs_experience');
            $table->text('qs_training')->nullable()->after('qs_eligibility');
            $table->text('description')->nullable()->after('qs_training');
            $table->text('competency')->nullable()->after('description');
            $table->json('responsibilities')->nullable()->after('competency');
            $table->json('requirements')->nullable()->after('responsibilities');
            $table->date('deadline')->nullable()->after('requirements');
            $table->json('custom_file_requirements')->nullable()->after('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staffing_positions', function (Blueprint $table) {
            $table->dropColumn([
                'plantilla_item',
                'employment_type',
                'location',
                'qs_education',
                'qs_experience',
                'qs_eligibility',
                'qs_training',
                'description',
                'competency',
                'responsibilities',
                'requirements',
                'deadline',
                'custom_file_requirements',
            ]);
        });
    }
};
