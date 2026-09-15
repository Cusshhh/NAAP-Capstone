<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background-color: #193153; color: #ffffff; padding: 24px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-top: 4px; }
        .status-under-review { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .status-interview { background-color: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }
        .status-rejected { background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .status-hired { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px 20px; margin: 20px 0; border-radius: 6px; }
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
            <p>This is to inform you that your application status for the position of <strong>{{ $application->job_title }}</strong> has been updated.</p>
            
            <div class="card">
                <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td width="35%" style="padding: 6px 0; font-weight: 600; color: #475569;">Position Applied:</td>
                        <td width="65%" style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $application->job_title }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">New Status:</td>
                        <td style="padding: 6px 0;">
                            @if($application->status === 'Under Review')
                                <span class="status-badge status-under-review">Under Evaluation / Review</span>
                            @elseif(str_contains($application->status, 'Interview'))
                                <span class="status-badge status-interview">{{ $application->status }}</span>
                            @elseif($application->status === 'Rejected')
                                <span class="status-badge status-rejected">Application Not Shortlisted</span>
                            @elseif($application->status === 'Hired')
                                <span class="status-badge status-hired">Hired</span>
                            @else
                                <span class="status-badge status-under-review">{{ $application->status }}</span>
                            @endif
                        </td>
                    </tr>
                </table>

                @if($application->status === 'Rejected' && !empty($application->dynamic_responses['rejection_reason']))
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 13.5px; color: #475569;">
                    <strong>Remarks / Feedback:</strong><br>
                    {{ $application->dynamic_responses['rejection_reason'] }}
                </div>
                @endif
            </div>

            @if($application->status === 'Under Review')
                <p style="font-size: 14px; color: #334155;">Your application is currently being thoroughly reviewed by our screening panel against the position's Qualification Standards (QS).</p>
            @elseif($application->status === 'Rejected')
                <p style="font-size: 14px; color: #334155;">While we were impressed with your qualifications, we have decided to proceed with other candidates whose profiles more closely match our current requirements for this specific role. We sincerely appreciate your interest in joining NAAP and encourage you to apply for future vacancies.</p>
            @elseif($application->status === 'Hired')
                <p style="font-size: 14px; color: #334155;">Congratulations! We are thrilled to welcome you to the NAAP team. Please log in to your candidate portal for onboarding details.</p>
            @endif

            <div class="btn-container">
                <a href="{{ route('login') }}" class="button">View Portal Dashboard</a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Best regards,<br><strong>NAAP Human Resources Team</strong><br>National Aviation Academy of the Philippines</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} National Aviation Academy of the Philippines. All rights reserved.<br>Villamor Air Base, Pasay City, Metro Manila</p>
        </div>
    </div>
</body>
</html>
