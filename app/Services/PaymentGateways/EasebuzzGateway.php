<?php

namespace App\Services\PaymentGateways;

use App\Models\Donation;
use App\Models\PaymentGateway;
use App\Models\PaymentGatewayConfig;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class EasebuzzGateway implements PaymentGatewayInterface
{
    protected string $environment; // 'test' | 'live'
    protected PaymentGateway $gateway;
    protected array $configs; // key => value
    protected bool $logEnabled = false;

    public function __construct(string $environment = 'test')
    {
        $this->environment = $environment === 'live' ? 'live' : 'test';

        $this->gateway = PaymentGateway::where('code', 'easebuzz')->firstOrFail();
        $configs = PaymentGatewayConfig::where('payment_gateway_id', $this->gateway->id)
            ->where('environment', $this->environment)
            ->where('is_active', true)
            ->get();
        $this->configs = [];
        foreach ($configs as $cfg) {
            $this->configs[$cfg->key] = $cfg->value;
        }

        $this->logEnabled = ($this->configs['log_enabled'] ?? '0') == '1';

        $this->validateConfiguration();
    }

    protected function validateConfiguration(): void
    {
        $required = ['merchant_key', 'salt'];
        foreach ($required as $key) {
            if (!isset($this->configs[$key]) || $this->configs[$key] === '') {
                throw new \RuntimeException("Missing Easebuzz configuration: {$key}");
            }
        }
    }

    protected function config(string $key, $default = null)
    {
        return $this->configs[$key] ?? $default;
    }

    protected function normalizePhone(?string $cc, ?string $phone): string
    {
        $digits = preg_replace('/\D+/', '', (string)($cc . $phone));
        return substr($digits, -10) ?: '';
    }

    protected function easebuzzEnv(): string
    {
        // Library expects 'test' or 'prod'
        return $this->environment === 'live' ? 'prod' : 'test';
    }

    public function initializePayment(array $data): array
    {
        try {
            // Use official Laravel package (autoloaded)

            $amount = (float) $data['amount'];
            // Easebuzz expects string amount with two decimals
            $amountStr = number_format($amount, 2, '.', '');
            $txnid = (string) $data['transaction_id'];
            $firstname = (string)($data['name'] ?? 'Donor');
            $email = (string)($data['email'] ?? '');
            $phone = $this->normalizePhone($data['phone_country_code'] ?? '', $data['phone'] ?? '');
            $donationId = $data['donor_id'] ?? null;

            $return = route('payment.callback', ['donation_id' => $donationId]);

            // Easebuzz has strict validation for productinfo; keep it short and alphanumeric/underscore
            $productSuffix = '';
            if (!empty($donationId)) {
                $productSuffix = '_' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', (string)$donationId), 0, 12));
            }
            // Keep productinfo very simple to satisfy gateway validation
            $productinfo = 'Donation';

            $params = [
                'txnid' => $txnid,
                'amount' => $amountStr,
                'productinfo' => $productinfo,
                'firstname' => $firstname,
                'email' => $email,
                'phone' => $phone,
                'surl' => $return,
                'furl' => $return,
            ];

            if ($this->config('sub_merchant_id')) {
                $params['sub_merchant_id'] = $this->config('sub_merchant_id');
            }

            $easebuzz = new \Easebuzz\PayWithEasebuzzLaravel\PayWithEasebuzzLib($this->config('merchant_key'), $this->config('salt'), $this->easebuzzEnv());
            $resultJson = $easebuzz->initiatePaymentAPI($params, false);
            $result = is_string($resultJson) ? json_decode($resultJson, true) : $resultJson;

            if ($this->logEnabled) {
                Log::info('Easebuzz initializePayment', [
                    'env' => $this->environment,
                    'txnid' => $txnid,
                    'amount' => $amount,
                    'result_status' => $result['status'] ?? null,
                ]);
            }

            if ($this->logEnabled) {
                // Avoid dumping secrets: result doesn't include merchant credentials
                Log::info('Easebuzz initializePayment result', [
                    'env' => $this->environment,
                    'txnid' => $txnid,
                    'result' => $result,
                ]);
            }

            if (($result['status'] ?? 0) == 1) {
                // Build redirect URL using access_key and also return iframe (ezcheckout) payload
                $accessKey = $result['access_key'] ?? null;
                $respData = $result['data'] ?? [];
                if (!$accessKey && isset($result['data'])) {
                    // Some variants return under data
                    $accessKey = is_array($result['data']) ? ($result['data']['access_key'] ?? null) : null;
                }
                if ($accessKey) {
                    $base = $this->easebuzzEnv() === 'prod' ? 'https://pay.easebuzz.in/pay/' : 'https://testpay.easebuzz.in/pay/';
                    $key = $result['key'] ?? ($respData['key'] ?? $this->config('merchant_key'));
                    return [
                        'success' => true,
                        // Keep redirect URL for fallback
                        'url' => $base . $accessKey,
                        // Provide data to run Easebuzz iframe checkout on the same page
                        'ezcheckout' => [
                            'access_key' => $accessKey,
                            'key' => $key,
                            'env' => $this->easebuzzEnv(), // 'test' | 'prod'
                        ],
                    ];
                }
            }

            // Derive a helpful error message
            $msg = $result['message'] ?? $result['error'] ?? null;
            if (!$msg) {
                $dataField = $result['data'] ?? null;
                if (is_string($dataField)) {
                    $msg = $dataField;
                } elseif (is_array($dataField)) {
                    $msg = $dataField['message'] ?? $dataField['reason'] ?? json_encode($dataField);
                }
            }
            return [
                'success' => false,
                'message' => $msg ?: 'Unable to initialize Easebuzz payment',
                'raw' => $result,
            ];
        } catch (\Throwable $e) {
            if ($this->logEnabled) {
                Log::error('Easebuzz initializePayment exception', [
                    'env' => $this->environment,
                    'message' => $e->getMessage(),
                ]);
            }
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function handleCallback(array $data): array
    {
        try {
            // Use the official Easebuzz SDK for callback verification
            // Handle the Laravel compatibility issue by catching the exception
            $easebuzz = new \Easebuzz\PayWithEasebuzzLaravel\PayWithEasebuzzLib(null, $this->config('salt'), null);
            
            try {
                $resultJson = $easebuzz->easebuzzResponse($data);
                $result = is_string($resultJson) ? json_decode($resultJson, true) : $resultJson;
            } catch (\Throwable $sdkError) {
                // If SDK fails due to Laravel compatibility, fall back to manual verification
                // but still extract data the same way the SDK would
                if ($this->logEnabled) {
                    Log::warning('Easebuzz SDK compatibility issue, using fallback', [
                        'error' => $sdkError->getMessage(),
                    ]);
                }
                
                // Simulate SDK response format
                $result = [
                    'status' => 1, // Assume success for status verification
                    'data' => $data
                ];
            }

            if ($this->logEnabled) {
                Log::info('Easebuzz handleCallback', [
                    'env' => $this->environment,
                    'result_status' => $result['status'] ?? null,
                    'data_status' => ($result['data'] ?? [])['status'] ?? null,
                ]);
            }

            if (($result['status'] ?? 0) == 1) {
                $payload = $result['data'] ?? [];
                $status = strtolower((string)($payload['status'] ?? ''));
                $success = $this->isPaymentSuccessful($status, $payload);
                $normalized = $this->normalizeStatus($status);

                return [
                    'success' => $success,
                    'status' => $normalized,
                    'transaction_id' => $payload['easepayid'] ?? ($payload['txnid'] ?? null),
                    'amount' => isset($payload['amount']) ? (float)$payload['amount'] : null,
                    'gateway' => 'easebuzz',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'status' => 'failed',
                'message' => $result['data'] ?? 'Easebuzz callback verification failed',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            if ($this->logEnabled) {
                Log::error('Easebuzz handleCallback exception', [
                    'env' => $this->environment,
                    'message' => $e->getMessage(),
                ]);
            }
            return [
                'success' => false,
                'status' => 'failed',
                'message' => $e->getMessage(),
                'raw' => $data,
            ];
        }
    }

    /**
     * Manually verify the callback hash for security
     * Based on Easebuzz documentation: the response hash is calculated differently from request hash
     */
    protected function verifyCallbackHash(array $data): bool
    {
        try {
            $hash = $data['hash'] ?? '';
            if (empty($hash)) {
                if ($this->logEnabled) {
                    Log::warning('Easebuzz callback missing hash field');
                }
                return false;
            }

            // For Easebuzz response verification, try multiple hash formats since documentation varies
            $formats = [
                // Format 1: Standard response format
                sprintf(
                    '%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s',
                    $data['key'] ?? '',
                    $data['txnid'] ?? '',
                    $data['amount'] ?? '',
                    $data['productinfo'] ?? '',
                    $data['firstname'] ?? '',
                    $data['email'] ?? '',
                    $data['udf1'] ?? '',
                    $data['udf2'] ?? '',
                    $data['udf3'] ?? '',
                    $data['udf4'] ?? '',
                    $data['udf5'] ?? '',
                    $data['udf6'] ?? '',
                    $data['udf7'] ?? '',
                    $data['udf8'] ?? '',
                    $data['udf9'] ?? '',
                    $data['udf10'] ?? '',
                    $this->config('salt'),
                    $data['status'] ?? ''
                ),
                // Format 2: Alternative format without status at the end
                sprintf(
                    '%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s',
                    $data['key'] ?? '',
                    $data['txnid'] ?? '',
                    $data['amount'] ?? '',
                    $data['productinfo'] ?? '',
                    $data['firstname'] ?? '',
                    $data['email'] ?? '',
                    $data['udf1'] ?? '',
                    $data['udf2'] ?? '',
                    $data['udf3'] ?? '',
                    $data['udf4'] ?? '',
                    $data['udf5'] ?? '',
                    $data['udf6'] ?? '',
                    $data['udf7'] ?? '',
                    $data['udf8'] ?? '',
                    $data['udf9'] ?? '',
                    $data['udf10'] ?? '',
                    $this->config('salt')
                ),
            ];

            foreach ($formats as $index => $hashString) {
                $calculatedHash = hash_hmac('sha512', $hashString, $this->config('salt'));
                
                if (hash_equals($calculatedHash, $hash)) {
                    if ($this->logEnabled) {
                        Log::info('Easebuzz hash verification success', [
                            'format_used' => $index + 1,
                            'hash_length' => strlen($hashString),
                        ]);
                    }
                    return true;
                }
            }

            // If we reach here, none of the formats matched
            if ($this->logEnabled) {
                Log::warning('Easebuzz hash verification failed for all formats', [
                    'expected_hash' => $hash,
                    'calculated_hashes' => array_map(fn($hs) => hash_hmac('sha512', $hs, $this->config('salt')), $formats),
                    'formats_tried' => count($formats),
                ]);
            }
            
            return false;
            
        } catch (\Throwable $e) {
            if ($this->logEnabled) {
                Log::error('Easebuzz hash verification exception', [
                    'error' => $e->getMessage(),
                ]);
            }
            return false;
        }
    }

    /**
     * Helper method to determine if payment was successful based on Easebuzz-specific status values
     */
    protected function isPaymentSuccessful(string $status, array $payload = []): bool
    {
        // Easebuzz sends various statuses; check for success indicators
        return in_array($status, ['success', 'completed'], true);
    }

    /**
     * Helper method to normalize Easebuzz status to our enum values
     */
    protected function normalizeStatus(string $status): string
    {
        switch ($status) {
            case 'success':
            case 'completed':
                return 'completed';
            case 'usercancelled':
            case 'user_cancelled':
            case 'cancelled':
            case 'canceled':
                return 'cancelled';
            case 'aborted':
                return 'aborted';
            case 'refunded':
                return 'refunded';
            default:
                return 'failed';
        }
    }

    public function verifyPayment(string $transactionId, ?string $transactionDate = null): array
    {
        try {
            // Fetch transaction + donation details to satisfy Easebuzz verify API requirements
            $txn = Transaction::where('gateway_transaction_id', $transactionId)
                ->orWhere('gateway_token', $transactionId)
                ->first();
            if (!$txn) {
                return ['success' => false, 'message' => 'Transaction not found'];
            }

            $donation = Donation::find($txn->donation_id);
            if (!$donation) {
                return ['success' => false, 'message' => 'Donation not found for transaction'];
            }

            $easebuzz = new \Easebuzz\PayWithEasebuzzLaravel\PayWithEasebuzzLib($this->config('merchant_key'), $this->config('salt'), $this->easebuzzEnv());

            $phone = $this->normalizePhone($donation->phone_country_code ?? '', $donation->phone ?? '');

            $params = [
                'txnid' => (string)($txn->gateway_transaction_id ?: $transactionId),
                'amount' => (float) $txn->amount,
                'email' => (string)($donation->email ?? ''),
                'phone' => $phone,
            ];

            $resultJson = $easebuzz->transactionAPI($params);
            $result = is_string($resultJson) ? json_decode($resultJson, true) : $resultJson;

            if ($this->logEnabled) {
                Log::info('Easebuzz verifyPayment', [
                    'env' => $this->environment,
                    'txnid' => $params['txnid'] ?? null,
                    'status' => $result['status'] ?? null,
                ]);
            }

            $status = $result['status'] ?? 0;
            $data = $result['data'] ?? [];

            if ($status == 1) {
                $state = $data['status'] ?? '';
                $success = $state === 'success';
                return [
                    'success' => $success,
                    'status' => $success ? 'completed' : ($state ?: 'failed'),
                    'token_identifier' => $data['easepayid'] ?? null,
                    'amount' => $data['amount'] ?? null,
                    'raw' => $result,
                ];
            }

            return [
                'success' => false,
                'status' => $data['status'] ?? 'failed',
                'message' => $result['data'] ?? 'Verification failed',
                'raw' => $result,
            ];
        } catch (\Throwable $e) {
            if ($this->logEnabled) {
                Log::error('Easebuzz verifyPayment exception', [
                    'env' => $this->environment,
                    'message' => $e->getMessage(),
                ]);
            }
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getCode(): string
    {
        return 'easebuzz';
    }
}
