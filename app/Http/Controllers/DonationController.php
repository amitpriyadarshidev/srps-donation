<?php

namespace App\Http\Controllers;

use App\Http\Requests\DonationProcessRequest;
use App\Models\Donation;
use App\Models\Country;
use App\Models\Currency;
use App\Models\Purpose;
use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Services\EmailService;
use App\Services\TransactionSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
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
     * Show the donation form in edit mode
     */
    public function edit($donationId)
    {
        $donation = Donation::with(['country.states', 'currency', 'purpose'])->findOrFail($donationId);

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

        return Inertia::render('donation/form', [
            'countries' => $countries,
            'currencies' => $currencies,
            'purposes' => $purposes,
            'donation' => $donation,
            'detectedCountry' => $donation->country, // prefer donor's selected country
        ]);
    }

    /**
     * Update an existing donation and return to payment selection
     */
    public function update(DonationProcessRequest $request, $donationId)
    {
        $validated = $request->validated();
        $donation = Donation::findOrFail($donationId);

        try {
            $donation->update([
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
                'skip_kyc' => $validated['skip_kyc'] ?? false,
                'tax_exemption' => $validated['tax_exemption'] ?? false,
                'pan_number' => $validated['pan_number'] ?? null,
            ]);

            if ($request->has('documents')) {
                $this->handleKycDocuments($request, $donation);
            }

            return redirect()->route('donation.payment-selection', $donation->id)
                ->with('success', 'Details updated. Please proceed to payment.');
        } catch (\Exception $e) {
            Log::error('Donation update error', ['error' => $e->getMessage()]);
            return back()->withErrors([
                'general' => 'An error occurred while updating your details. Please try again.'
            ])->withInput();
        }
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

            // Handle KYC document uploads if any (new structure only)
            if ($request->has('documents')) {
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
                'input' => $request->except(['documents']) // Exclude file uploads from log
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

        $gateways = PaymentGateway::orderBy('display_order')
            ->get(['id', 'name', 'code', 'logo', 'description', 'is_default', 'is_active']);

        // Prefer DB-backed last transaction (order by created time for UUID PK)
        $recent = Transaction::where('donation_id', $donation->id)->latest('created_at')->first();
        $lastTxn = null;
        if ($recent) {
            $lastTxn = [
                // Expose our internal transaction UUID as display id
                'transaction_id' => $recent->id,
                'status' => $recent->status,
                'amount' => (string)$recent->amount,
                'currency' => $donation->currency->symbol ?? '',
                'gateway' => optional($recent->gateway)->code,
                'started_at' => optional($recent->created_at)->toIso8601String(),
            ];
        }

        return inertia('donation/payment-selection', [
            'donation' => $donation,
            'gateways' => $gateways,
            'lastTransaction' => $lastTxn,
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

    /**
     * Begin payment with selected gateway
     */
    public function beginPayment(Request $request, $donationId)
    {
        $request->validate([
            'gateway' => 'required|string|exists:payment_gateways,code',
        ]);

        $donation = Donation::with(['currency', 'purpose'])->findOrFail($donationId);
        $gateway = \App\Models\PaymentGateway::where('code', $request->input('gateway'))->firstOrFail();
        $env = config('app.env') === 'production' ? 'live' : 'test';

        // Resolve gateway service dynamically
        $factory = new \App\Services\Payment\GatewayFactory();
        $service = $factory->make($gateway->code, $env);
        if (!$service) {
            return response()->json([
                'ok' => false,
                'message' => 'Selected gateway is not supported yet.',
            ], 422);
        }

            // Build a transaction reference with gateway-based prefix for traceability
            $prefix = strtoupper(substr($gateway->code, 0, 3));
            $txnId = $prefix . '-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));

            $response = $service->initializePayment([
                'amount' => (float) $donation->amount * 1.05, // include 5% fee
                'currency' => $donation->currency->code ?? 'INR',
                'transaction_id' => $txnId,
                'donor_id' => $donation->id,
                'name' => trim(($donation->first_name ?? '') . ' ' . ($donation->last_name ?? '')),
                'email' => $donation->email,
                'phone' => $donation->phone,
                'phone_country_code' => $donation->phone_country_code,
            ]);

            if (!($response['success'] ?? false)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Failed to initialize payment',
                ], 422);
            }

            // Persist transaction in DB
            $transaction = Transaction::create([
                'donation_id' => $donation->id,
                'payment_gateway_id' => $gateway->id,
                // Our outbound reference for the gateway
                'gateway_transaction_id' => $txnId,
                'amount' => (float) $donation->amount * 1.05,
                'currency_id' => $donation->currency_id,
                'status' => 'pending',
            ]);

            // Store optimized session snapshot (legacy behavior)
            (new TransactionSessionService())->store($transaction->id, [
                'donation_id' => $donation->id,
                'amount' => (float) $donation->amount * 1.05,
                'currency' => $donation->currency->symbol ?? '',
                'donor_name' => trim(($donation->first_name ?? '') . ' ' . ($donation->last_name ?? '')),
                'email' => $donation->email,
                'phone' => ($donation->phone_country_code ?? '') . ($donation->phone ?? ''),
                'status' => 'pending',
                'gateway' => $gateway->code,
            ]);

            return response()->json([
                'ok' => true,
                'gateway' => $gateway->code,
                'payload' => [
                    'form_data' => $response['data'] ?? [],
                    'mer_array' => $response['mer_array'] ?? [],
                    'environment' => $env,
                    'returnUrl' => route('payment.callback', ['donation_id' => $donation->id]),
                ],
            ]);
    }

    /**
     * Global payment callback endpoint.
     */
    public function paymentCallback(Request $request)
    {
        \Log::info('Payment callback received', [
            'query' => $request->query(),
            'post' => $request->all(),
        ]);

        $service = new \App\Services\Payment\PaymentCallbackService(new \App\Services\Payment\GatewayResolver());
        $result = $service->handle($request);

        $donationId = $request->query('donation_id') ?? $request->input('donation_id');

        // Update DB transaction and session service snapshot
        if ($donationId) {
            $txn = Transaction::where('donation_id', $donationId)->latest('created_at')->first();
            if ($txn) {
                $txn->status = ($result['success'] ?? false) ? 'completed' : ($result['status'] ?? 'failed');
                // Worldline returns token; store it separately as gateway_token
                if (!empty($result['transaction_id'])) {
                    $txn->gateway_token = $result['transaction_id'];
                }
                $txn->gateway_response = $request->all();
                $txn->save();

                // Update session snapshot if exists
                (new TransactionSessionService())->updateStatus($txn->id, $txn->status);
            }
        }

        // TODO: lookup donation/transaction by identifiers and persist status
        if ($result['success'] ?? false) {
            if ($donationId) {
                return redirect()->route('donation.confirmation', $donationId)
                    ->with('success', 'Payment completed successfully.');
            }
            return redirect()->route('home')->with('success', 'Payment completed successfully.');
        }

        // On cancel/failure, send user back to payment-selection
        if ($donationId) {
            return redirect()->route('donation.payment-selection', $donationId)
                ->with('error', $result['message'] ?? 'Payment cancelled or failed. Please try again.');
        }

        return redirect()->route('home')->with('error', $result['message'] ?? 'Payment failed or cancelled.');
    }

    /**
     * Check latest transaction status for a donation via the gateway's verify API
     */
    public function checkStatus(Request $request, $donationId)
    {
        $request->validate([
            'transaction_id' => 'required|uuid',
        ]);
        $donation = Donation::with('currency')->findOrFail($donationId);

        // Find specific transaction by UUID and ensure it belongs to this donation
        $txn = Transaction::where('id', $request->input('transaction_id'))
            ->where('donation_id', $donation->id)
            ->first();
        if (!$txn) {
            return response()->json(['ok' => false, 'message' => 'Transaction not found for this donation.'], 404);
        }

        $gatewayCode = optional($txn->gateway)->code ?? null;
        if (!$gatewayCode) {
            return response()->json(['ok' => false, 'message' => 'Gateway not associated with transaction.'], 422);
        }

        // Resolve gateway service dynamically
        $factory = new \App\Services\Payment\GatewayFactory();
        $service = $factory->make($gatewayCode, app()->environment('production') ? 'live' : 'test');
        if ($service) {
            // Prefer the gateway reference we created at init
            $ref = $txn->gateway_transaction_id ?: $txn->gateway_token;
            $verify = $service->verifyPayment((string)$ref, optional($txn->created_at)->format('d-m-Y'));

            // Only update DB and session if verification confirms success
            if (!empty($verify['success'])) {
                $txn->status = 'completed';
                if (!empty($verify['token_identifier'])) {
                    $txn->gateway_token = $verify['token_identifier'];
                }
                $txn->gateway_response = array_merge((array)$txn->gateway_response ?? [], ['verify' => $verify]);
                $txn->save();

                (new TransactionSessionService())->updateStatus($txn->id, $txn->status);

                return response()->json([
                    'ok' => true,
                    'status' => 'completed',
                    'redirect' => route('donation.confirmation', $donation->id),
                ]);
            }

            return response()->json([
                'ok' => false,
                'status' => $verify['status'] ?? $txn->status,
                'message' => $verify['message'] ?? 'Payment not completed yet.',
                'data' => $verify,
            ]);
        }

        return response()->json(['ok' => false, 'message' => 'Gateway verification not implemented.'], 422);
    }
}
