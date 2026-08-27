<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>NAAP Security Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
    <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #193153; padding: 24px; text-align: center;">
            <h1 style="color: #ffdd59; margin: 0; font-size: 20px; font-weight: bold; tracking-wide: 1px;">
                NATIONAL AVIATION ACADEMY OF THE PHILIPPINES
            </h1>
            <p style="color: #ffffff; margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">
                HR Portal & Administrative Security
            </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
            <h2 style="color: #193153; margin-top: 0; font-size: 18px;">Security Verification Passcode</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                Hello <strong>{{ $userName }}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                You requested a 6-digit security verification code for <strong>{{ $actionType }}</strong>. Please enter the code below to complete your authentication:
            </p>

            <!-- OTP Box -->
            <div style="background-color: #f0f4f8; border: 2px dashed #193153; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #193153; letter-spacing: 8px;">
                    {{ $otpCode }}
                </span>
                <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0 0;">Valid for 10 minutes. Do not share this code with anyone.</p>
            </div>

            <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
                If you did not request this verification code, please secure your account immediately or contact NAAP IT Systems Administrator.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                &copy; {{ date('Y') }} National Aviation Academy of the Philippines. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
