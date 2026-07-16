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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('application_id');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
            $table->date('date');
            $table->string('time');
            $table->text('panel_members')->nullable();
            $table->string('venue');
            $table->boolean('notify_applicant')->default(false);
            $table->text('result_notes')->nullable();
            $table->string('candidate_name');
            $table->string('position');
            $table->string('applicant_email');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
