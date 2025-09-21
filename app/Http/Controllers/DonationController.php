<?php

namespace App\Http\Controllers;

use App\Http\Requests\DonationProcessRequest;
use App\Models\Donation;
use App\Models\Country;
use App\Models\Currency;
use App\Models\Purpose;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DonationController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Display the donation form home page
     */
    public function index()
    {
        // Fetch dynamic data from database
        $countries = Country::active()
            ->orderBy('name')
            ->with(['states:id,country_id,name,code', 'currency:id,code'])
            ->get(['id', 'name', 'iso2 as code', 'phone_code', 'default_currency', 'flag_icon']);
        
        $currencies = Currency::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'symbol']);
        
        $purposes = Purpose::active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'category', 'icon']);

        // Simple country detection based on locale (can be enhanced with IP geolocation)
        $detectedCountry = $countries->where('code', 'US')->first();

    return Inertia::render('donation/form', [
            'countries' => $countries,
            'currencies' => $currencies,
            'purposes' => $purposes,
            'detectedCountry' => $detectedCountry,
        ]);
    }

    /**
     * Process the donation form submission
     */
    public function process(DonationProcessRequest $request)
    {
        // The validation has already been handled by DonationProcessRequest
        $validated = $request->validated();

        try {
            // Create the donation with validated data
            $donation = Donation::create([
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'phone_country_code' => $validated['phone_country_code'],
                'address_line_1' => $validated['address_line_1'],
                'address_line_2' => $validated['address_line_2'] ?? null,
                'state_id' => $validated['state'],
                'city' => $validated['city'],
                'zip_code' => $validated['zip_code'],
                'country_id' => $validated['country'],
                'currency_id' => $validated['currency'],
                'amount' => $validated['amount'],
                'purpose_id' => $validated['purpose'],
                'kyc_documents' => json_encode([]), // Will be updated when file upload is implemented
                'skip_kyc' => $validated['skip_kyc'] ?? false,
                'tax_exemption' => $validated['tax_exemption'] ?? false,
                'pan_number' => $validated['pan_number'] ?? null,
                'alternative_method' => $validated['alternative_method'] ?? false,
                'status' => 'pending'
            ]);

            // Handle KYC document uploads if any
            if ($request->has('documents') || $request->hasFile('kyc_documents')) {
                $this->handleKycDocuments($request, $donation);
            }

            // Send confirmation email
            $this->emailService->sendDonationConfirmation($donation);

            Log::info('Donation created successfully', [
                'donation_id' => $donation->id,
                'amount' => $donation->amount,
                'currency' => $donation->currency->code ?? 'Unknown',
                'email' => $donation->email
            ]);

            // For Inertia, redirect to payment selection
            return redirect()->route('donation.payment-selection', $donation->id)
                ->with('success', 'Donation submitted successfully! Please proceed to payment.');

        } catch (\Exception $e) {
            Log::error('Donation processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->except(['kyc_documents']) // Exclude file uploads from log
            ]);

            return back()->withErrors([
                'general' => 'An error occurred while processing your donation. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Handle KYC document file uploads
     */
    private function handleKycDocuments(DonationProcessRequest $request, Donation $donation)
    {
        $documents = [];
        
        // Handle new documents structure
        if ($request->has('documents') && is_array($request->input('documents'))) {
            foreach ($request->input('documents') as $index => $documentData) {
                if (isset($documentData['file']) && $documentData['file'] instanceof \Illuminate\Http\UploadedFile && $documentData['file']->isValid()) {
                    $file = $documentData['file'];
                    
                    // Generate unique filename
                    $filename = 'kyc_' . $donation->id . '_' . ($index + 1) . '_' . time() . '.' . $file->getClientOriginalExtension();
                    
                    // Store file in private storage
                    $path = $file->storeAs('kyc_documents', $filename, 'private');
                    
                    $documents[] = [
                        'type' => $documentData['type'] ?? 'Unknown Document',
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'uploaded_at' => now()->toISOString()
                    ];
                }
            }
        }
        
        // Handle legacy kyc_documents structure (for backward compatibility)
        if ($request->hasFile('kyc_documents')) {
            foreach ($request->file('kyc_documents') as $index => $file) {
                if ($file->isValid()) {
                    // Generate unique filename
                    $filename = 'kyc_legacy_' . $donation->id . '_' . ($index + 1) . '_' . time() . '.' . $file->getClientOriginalExtension();
                    
                    // Store file in private storage
                    $path = $file->storeAs('kyc_documents', $filename, 'private');
                    
                    $documents[] = [
                        'type' => 'Legacy Document',
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'uploaded_at' => now()->toISOString()
                    ];
                }
            }
        }
        
        // Update donation with KYC documents
        if (!empty($documents)) {
            $donation->update([
                'kyc_documents' => json_encode($documents)
            ]);
        }
    }

    /**
     * Show donation payment selection page
     */
    public function paymentSelection($donationId)
    {
        $donation = Donation::with(['country', 'currency', 'purpose'])
            ->findOrFail($donationId);

        return inertia('donation/payment-selection', [
            'donation' => $donation
        ]);
    }

    /**
     * Show donation confirmation page
     */
    public function confirmation($donationId)
    {
        $donation = Donation::with(['country', 'currency', 'purpose'])
            ->findOrFail($donationId);

        return inertia('donation/confirmation', [
            'donation' => $donation
        ]);
    }
}
