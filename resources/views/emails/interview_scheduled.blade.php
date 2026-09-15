<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Schedule Invitation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background-color: #193153; color: #ffffff; padding: 24px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .card { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 18px 20px; margin: 20px 0; border-radius: 4px; }
        .card-title { font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
        .detail-label { width: 140px; font-weight: 600; color: #475569; }
        .detail-value { color: #0f172a; flex: 1; font-weight: 500; }
        .checklist { background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
        .checklist h4 { margin: 0 0 10px 0; color: #854d0e; font-size: 14px; text-transform: uppercase; }
        .checklist ul { margin: 0; padding-left: 20px; color: #713f12; font-size: 13.5px; }
        .checklist li { margin-bottom: 6px; }
        .btn-container { text-align: center; margin: 28px 0 16px 0; }
        .button { display: inline-block; padding: 12px 28px; background-color: #193153; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; transition: background-color 0.2s; }
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
            <div class="greeting">Dear {{ $interview->candidate_name }},</div>
            <p>We are pleased to inform you that your application for <strong>{{ $interview->position }}</strong> has been shortlisted for an interview!</p>
            
            <div class="card">
                <div class="card-title">Interview Details</div>
                <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td width="35%" style="padding: 6px 0; font-weight: 600; color: #475569;">Candidate Name:</td>
                        <td width="65%" style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $interview->candidate_name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Position Applied:</td>
                        <td style="padding: 6px 0; color: #0f172a;">{{ $interview->position }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Scheduled Date:</td>
                        <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">{{ \Carbon\Carbon::parse($interview->date)->format('F j, Y (l)') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Scheduled Time:</td>
                        <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">{{ $interview->time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Venue / Platform:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $interview->venue }}</td>
                    </tr>
                    @if($interview->panel_members)
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #475569;">Interview Panel:</td>
                        <td style="padding: 6px 0; color: #0f172a;">{{ $interview->panel_members }}</td>
                    </tr>
                    @endif
                </table>
            </div>

            <div class="checklist">
                <h4>📌 Required Document Checklist</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px;">Please prepare and bring/present the following requirements for verification:</p>
                <ul>
                    <li>Two (2) Valid Government-Issued Photo IDs</li>
                    <li>Updated Personal Data Sheet (PDS) / Comprehensive Resume</li>
                    <li>Official Transcript of Records (TOR) & Diploma</li>
                    <li>PRC License / Certificate of Eligibility (if applicable to position)</li>
                    <li>Certificates of Employment & Training / Seminars</li>
                </ul>
            </div>

            @if($interview->result_notes)
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 14px 18px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #475569;">
                <strong>Additional Notes:</strong><br>
                {{ $interview->result_notes }}
            </div>
            @endif

            <p style="font-size: 13.5px; color: #475569;">Please confirm your attendance by replying to this email or checking your status directly on the portal.</p>

            <div class="btn-container">
                <a href="{{ route('login') }}" class="button">Access NAAP Careers Portal</a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Best regards,<br><strong>NAAP Human Resources Selection Committee</strong><br>National Aviation Academy of the Philippines</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} National Aviation Academy of the Philippines. All rights reserved.<br>Villamor Air Base, Pasay City, Metro Manila</p>
        </div>
    </div>
</body>
</html>
