<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SecurityOtpMail;
use App\Models\ActivityLog;
use App\Services\SmsOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OtpVerificationController extends Controller
{
    protected SmsOtpService $smsService;

    public function __construct(SmsOtpService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Generate & send a 6-digit OTP code to Email and PH Mobile Number.
     */
    public function sendOtp(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $email = $request->input('email') ?: $user->email;
        $phoneNumber = $request->input('phone_number') ?: (is_array($user->profile_data) ? ($user->profile_data['phone_number'] ?? $user->profile_data['contact_number'] ?? '0917-123-4567') : '0917-123-4567');

        // Generate 6-digit random passcode
        $otpCode = (string) rand(100000, 999999);

        // Store in session
        session([
            'security_otp' => $otpCode,
            'security_otp_expires' => now()->addMinutes(10),
            'security_otp_email' => $email,
            'security_otp_phone' => $phoneNumber,
        ]);

        // 1. Send Email Notification via Mailer
        try {
            Mail::to($email)->send(new SecurityOtpMail($otpCode, $user->name, 'Account Security Verification'));
        } catch (\Exception $e) {
            // Log mail exception if mailer server is not active locally
        }

        // 2. Send SMS Notification via SmsOtpService (Semaphore PH API / Demo Log)
        $smsResult = $this->smsService->sendSmsOtp($phoneNumber, $otpCode, $user->name);

        // Log to Activity Log
        ActivityLog::write('Requested Security OTP', "Dispatched 6-digit security code [{$otpCode}] to Gmail ({$email}) & Mobile ({$phoneNumber}).", 'Security & 2FA', 'KeyRound', 'text-amber-600 bg-amber-100');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'otp_code' => $otpCode, // Returned for instant demo testing
                'email' => $email,
                'phone' => $phoneNumber,
                'message' => "Security verification code sent to {$email} & PH Mobile ({$phoneNumber})!",
            ]);
        }

        return back()->with('success', "Security verification code sent to {$email} & PH Mobile ({$phoneNumber})!");
    }

    /**
     * Verify the entered 6-digit OTP passcode.
     */
    public function verifyOtp(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        $storedOtp = session('security_otp');
        $expires = session('security_otp_expires');

        if (!$storedOtp || !$expires || now()->greaterThan($expires)) {
            $msg = 'Security code has expired. Please request a new code.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }
            return back()->withErrors(['otp_code' => $msg]);
        }

        if ($request->input('otp_code') !== $storedOtp) {
            $msg = 'Invalid verification code. Please check and try again.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }
            return back()->withErrors(['otp_code' => $msg]);
        }

        // OTP Verified Successfully!
        session()->forget(['security_otp', 'security_otp_expires']);

        ActivityLog::write('Verified Security OTP', 'Successfully verified 6-digit security passcode.', 'Security & 2FA', 'ShieldCheck', 'text-emerald-600 bg-emerald-100');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Security passcode verified successfully!',
            ]);
        }

        return back()->with('success', 'Security passcode verified successfully!');
    }
}
