<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'is_super_admin' => $request->user()->isSuperAdmin(),
                    'is_hr_admin' => $request->user()->isHrAdmin(),
                    'is_hr_staff' => $request->user()->isHrStaff(),
                    'is_admin' => $request->user()->isAdmin() || in_array($request->user()->email, ['admin@naap.edu.ph', 'admin@admin.com']),
                    'campus_name' => 'Villamor Air Base, Pasay City',
                ]) : null,
            ],
            'unread_messages_count' => $request->user() && ($request->user()->isAdmin() || in_array($request->user()->email, ['admin@naap.edu.ph', 'admin@admin.com']))
                ? \App\Models\Message::where('sender_id', '!=', $request->user()->id)->where('is_read', false)->count()
                : 0,
            'flash' => [
                'message' => $request->session()->get('message'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
