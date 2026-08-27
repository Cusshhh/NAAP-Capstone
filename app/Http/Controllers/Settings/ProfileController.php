<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'avatar' => ['nullable', 'image', 'max:5120'],
            'avatar_data' => ['nullable', 'string'],
            'remove_avatar' => ['nullable', 'boolean'],
        ]);

        $user->name = $request->input('name');

        if ($user->email !== $request->input('email')) {
            $user->email = $request->input('email');
            $user->email_verified_at = null;
        }

        $profileData = is_array($user->profile_data) ? $user->profile_data : [];
        $profileData['phone_number'] = $request->input('phone_number');
        $profileData['contact_number'] = $request->input('phone_number');

        if ($request->boolean('remove_avatar')) {
            $profileData['avatar_url'] = null;
            $profileData['photo'] = null;
            $profileData['avatar'] = null;
        } elseif ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $url = '/storage/'.$path;
            $profileData['avatar_url'] = $url;
            $profileData['photo'] = $url;
            $profileData['avatar'] = $url;
        } elseif ($request->input('avatar_data')) {
            $avatarData = $request->input('avatar_data');
            if (str_starts_with($avatarData, 'data:image')) {
                try {
                    @[$type, $data] = explode(';', $avatarData);
                    @[, $data] = explode(',', $data);
                    $decoded = base64_decode($data);
                    if ($decoded) {
                        $filename = 'avatars/user_'.$user->id.'_'.time().'.jpg';
                        $fullPath = storage_path('app/public/'.$filename);
                        if (! is_dir(dirname($fullPath))) {
                            mkdir(dirname($fullPath), 0755, true);
                        }
                        file_put_contents($fullPath, $decoded);
                        $url = '/storage/'.$filename;
                    } else {
                        $url = $avatarData;
                    }
                } catch (\Exception $ex) {
                    $url = $avatarData;
                }
            } else {
                $url = $avatarData;
            }
            $profileData['avatar_url'] = $url;
            $profileData['photo'] = $url;
            $profileData['avatar'] = $url;
        }

        $user->profile_data = $profileData;
        $user->save();

        \App\Models\ActivityLog::write('Updated Profile Information', "Updated account profile details and avatar for {$user->name}.", 'Account Settings', 'UserCheck', 'text-blue-600 bg-blue-100');

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
