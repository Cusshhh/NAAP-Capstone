<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background-color: #193153; color: #ffffff; padding: 24px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .card { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 18px 20px; margin: 20px 0; border-radius: 4px; }
        .card-title { font-size: 14px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .btn-container { text-align: center; margin: 28px 0 16px 0; }
        .button { display: inline-block; padding: 12px 28px; background-color: #193153; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; }
        .footer { background-color: #f8fafc; padding: 16px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NATIONAL AVIATION ACADEMY OF THE PHILIPPINES</h1>
            <p>Human Resources Management Office</p>
        </div>
        <div class="content">
            <div class="greeting">Dear {{ $application->applicant_name }},</div>
            <p>Thank you for applying to the National Aviation Academy of the Philippines! We have successfully received your application for the position of <strong>{{ $application->job_title }}</strong>.</p>
            
            <div class="card">
                <div class="card-title">Application Summary</div>
                <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td width="35%" style="padding: 6px 0; font-weight: 600; color: #475569;">Application Reference:</td>
                        <td width="65%" style="padding: 6px 0; color: #0f172a; font-weight: 700;">#APP-{{ str_pad($application->id, 5, '0', STR_PAD_LEFT) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Position Applied:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $application->job_title }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Date Submitted:</td>
                        <td style="padding: 6px 0; color: #0f172a;">{{ $application->created_at ? $application->created_at->format('F j, Y (h:i A)') : date('F j, Y') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Status:</td>
                        <td style="padding: 6px 0; color: #16a34a; font-weight: 700;">Submitted / Under Initial Evaluation</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 14px; color: #334155;">Our Human Resources Selection Committee will evaluate your qualifications. You will receive updates via email or your candidate portal as your application progresses.</p>

            <div class="btn-container">
                <a href="{{ route('login') }}" class="button">Track Application Status</a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Best regards,<br><strong>NAAP Human Resources Recruitment Team</strong><br>National Aviation Academy of the Philippines</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} National Aviation Academy of the Philippines. All rights reserved.<br>Villamor Air Base, Pasay City, Metro Manila</p>
        </div>
    </div>
</body>
</html>
