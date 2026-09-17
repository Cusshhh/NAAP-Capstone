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
        Schema::create('applicant_qualification_analyses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('application_id')->index();
            $table->string('applicant_email', 255)->nullable()->index();
            $table->unsignedInteger('job_id')->index();
            $table->decimal('overall_score', 5, 2)->default(0.00);
            $table->text('analysis_summary')->nullable();
            $table->string('analysis_version', 50)->default('v1.0');
            $table->json('itemized_results')->nullable();
            $table->string('final_decision', 50)->nullable()->default('Under Review');
            $table->text('decision_notes')->nullable();
            $table->string('decided_by', 255)->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_qualification_analyses');
    }
};
