<?php

namespace App\Services;

use App\Models\Donation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send donation confirmation email to the donor
     */
    public function sendDonationConfirmation(Donation $donation)
    {
        try {
            // For now, just log the email sending
            // You can implement actual email sending using Laravel Mail
            Log::info('Donation confirmation email would be sent', [
                'donation_id' => $donation->id,
                'email' => $donation->email,
                'amount' => $donation->amount,
                'currency' => $donation->currency->code ?? 'Unknown'
            ]);

            // TODO: Implement actual email sending
            // Mail::to($donation->email)->send(new DonationConfirmationMail($donation));

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send donation confirmation email', [
                'donation_id' => $donation->id,
                'email' => $donation->email,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send donation receipt email to the donor
     */
    public function sendDonationReceipt(Donation $donation)
    {
        try {
            Log::info('Donation receipt email would be sent', [
                'donation_id' => $donation->id,
                'email' => $donation->email,
                'amount' => $donation->amount
            ]);

            // TODO: Implement actual email sending
            // Mail::to($donation->email)->send(new DonationReceiptMail($donation));

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send donation receipt email', [
                'donation_id' => $donation->id,
                'email' => $donation->email,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Send donation notification to admins
     */
    public function sendAdminNotification(Donation $donation)
    {
        try {
            Log::info('Admin notification email would be sent', [
                'donation_id' => $donation->id,
                'amount' => $donation->amount,
                'donor_email' => $donation->email
            ]);

            // TODO: Implement actual email sending to admin(s)
            // Mail::to(config('donation.admin_email'))->send(new DonationNotificationMail($donation));

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification email', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}