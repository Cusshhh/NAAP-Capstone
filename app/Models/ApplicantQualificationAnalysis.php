<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantQualificationAnalysis extends Model
{
    use HasFactory;

    protected $table = 'applicant_qualification_analyses';

    protected $fillable = [
        'application_id',
        'applicant_email',
        'job_id',
        'overall_score',
        'analysis_summary',
        'analysis_version',
        'itemized_results',
        'final_decision',
        'decision_notes',
        'decided_by',
        'decided_at',
    ];

    protected $casts = [
        'overall_score' => 'float',
        'itemized_results' => 'array',
        'decided_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class, 'job_id');
    }
}
