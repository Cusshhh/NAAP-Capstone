<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->nullable();
            $table->timestamps();
        });

        // Seed default departments into MySQL
        $defaultDepartments = [
            'Academics',
            'Administration',
            'Maintenance',
            'Flight Training',
            'Medical',
            'Safety',
            'Student Affairs',
            'Flight Operations',
            'IT',
        ];

        foreach ($defaultDepartments as $dept) {
            DB::table('departments')->insertOrIgnore([
                'name' => $dept,
                'code' => strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $dept), 0, 4)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
