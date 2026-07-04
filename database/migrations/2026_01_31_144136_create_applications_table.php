<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->increments('id');
            // We store the job details directly here for simplicity, 
            // or you can reference a 'jobs' table with a foreign key.
            $table->unsignedInteger('job_id'); 
            $table->string('job_title', 255);
            
            // Applicant Details
            $table->string('email', 255); // We link users via email
            $table->string('applicant_name', 255);
            $table->string('phone_number', 255)->nullable();
            $table->string('education', 255)->nullable();
            
            // Status: Submitted, Under Review, Hired, Rejected
            $table->string('status', 255)->default('Submitted'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};