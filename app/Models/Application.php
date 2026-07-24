<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'job_title',
        'email',
        'applicant_name',
        'phone_number',
        'education',
        'status',
        'to_follow_docs',
        'custom_file_responses',
        'dynamic_responses',
    ];

    protected $casts = [
        'to_follow_docs' => 'array',
        'custom_file_responses' => 'array',
        'dynamic_responses' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class, 'job_id');
    }

    public function getCampusAttribute()
    {
        if ($this->vacancy && $this->vacancy->campus) {
            return $this->vacancy->campus->campus_name;
        }
        return $this->vacancy ? $this->vacancy->location : 'NAAP - Villamor Campus';
    }

    public function getApplicantNameAttribute($value)
    {
        if ($value) return $value;
        return $this->user ? $this->user->name : 'Valued Applicant';
    }
}