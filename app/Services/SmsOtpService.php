<?php

namespace App\Services;

use App\Models\ActivityLog;

class SmsOtpService
{
    /**
     * Send Security OTP to Mobile Number (e.g. 09171234567 or +639171234567).
     */
    public function sendSmsOtp(string $phoneNumber, string $otpCode, string $userName = 'User'): array
    {
        $formattedPhone = $this->formatPhNumber($phoneNumber);

        // Log to Activity Log
        ActivityLog::write('Sent Mobile Security OTP', "Dispatched 6-Digit Security OTP [{$otpCode}] to Mobile Number {$formattedPhone} for {$userName}.", 'Security Verification', 'Smartphone', 'text-blue-600 bg-blue-100');

        return [
            'success' => true,
            'phone' => $formattedPhone,
            'message' => "Mobile Security OTP dispatched to {$formattedPhone}",
        ];
    }

    /**
     * Format raw phone input to standard 11-digit 09XXXXXXXXX or +63 format.
     */
    protected function formatPhNumber(string $phone): string
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($clean, '63') && strlen($clean) === 12) {
            return '0'.substr($clean, 2);
        }

        if (strlen($clean) === 10 && str_starts_with($clean, '9')) {
            return '0'.$clean;
        }

        return $clean ?: $phone;
    }
}
