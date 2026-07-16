<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'date',
        'time',
        'panel_members',
        'venue',
        'notify_applicant',
        'result_notes',
        'candidate_name',
        'position',
        'applicant_email',
    ];

    protected $casts = [
        'notify_applicant' => 'boolean',
        'date' => 'date',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
