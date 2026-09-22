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
        Schema::table('vacancies', function (Blueprint $table) {
            if (! Schema::hasColumn('vacancies', 'plantilla_item')) {
                $table->string('plantilla_item', 255)->nullable()->after('title');
            }
            if (! Schema::hasColumn('vacancies', 'competency')) {
                $table->text('competency')->nullable()->after('description');
            }
            if (! Schema::hasColumn('vacancies', 'qs_education')) {
                $table->text('qs_education')->nullable()->after('competency');
            }
            if (! Schema::hasColumn('vacancies', 'qs_experience')) {
                $table->text('qs_experience')->nullable()->after('qs_education');
            }
            if (! Schema::hasColumn('vacancies', 'qs_eligibility')) {
                $table->text('qs_eligibility')->nullable()->after('qs_experience');
            }
            if (! Schema::hasColumn('vacancies', 'qs_training')) {
                $table->text('qs_training')->nullable()->after('qs_eligibility');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropColumn([
                'plantilla_item',
                'competency',
                'qs_education',
                'qs_experience',
                'qs_eligibility',
                'qs_training',
            ]);
        });
    }
};
