<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otpCode;
    public string $userName;
    public string $actionType;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otpCode, string $userName = 'Administrator', string $actionType = 'Account Security Verification')
    {
        $this->otpCode = $otpCode;
        $this->userName = $userName;
        $this->actionType = $actionType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🔐 Your NAAP Security Verification Code: {$this->otpCode}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.security_otp',
        );
    }
}
