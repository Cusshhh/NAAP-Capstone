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
            $table->json('custom_file_requirements')->nullable()->after('status');
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->json('custom_file_responses')->nullable()->after('to_follow_docs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropColumn('custom_file_requirements');
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('custom_file_responses');
        });
    }
};
