<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'details',
        'time',
        'date',
        'icon',
        'color',
        'campus',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to write an activity log entry.
     */
    public static function write($action, $details, $campus = 'System', $icon = 'Shield', $color = 'text-slate-500 bg-slate-100')
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'details' => $details,
            'time' => 'Just now',
            'date' => now()->toDateString(),
            'icon' => $icon,
            'color' => $color,
            'campus' => $campus ?: 'System',
        ]);
    }
}
