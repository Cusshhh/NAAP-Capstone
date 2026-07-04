<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .header { background-color: #193153; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #718096; margin-top: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #ffdd59; color: #193153; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations!</h1>
        </div>
        <div class="content">
            <p>Dear {{ $application->applicant_name }},</p>
            <p>We are pleased to inform you that you have been <strong>Hired</strong> for the position of <strong>{{ $application->job_title }}</strong> at the National Aviation Academy of the Philippines (NAAP).</p>
            <p>Your qualifications and experience impressed our search committee, and we are excited to have you join our team of aviation professionals.</p>
            <p>Please log in to your dashboard to view the next steps for your onboarding process.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ route('login') }}" class="button">Go to Dashboard</a>
            </div>
            <p>Welcome aboard!</p>
            <p>Best regards,<br>NAAP Human Resources Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} National Aviation Academy of the Philippines. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
