<?php

namespace App\Services\PaymentGateways;

use App\Models\PaymentGateway;
use App\Models\PaymentGatewayConfig;
use Illuminate\Support\Facades\Log;

class WorldlineGateway implements PaymentGatewayInterface
{
    protected string $environment;
    protected PaymentGateway $gateway;
    protected array $configs; // keyed by key => value
    protected bool $logEnabled = false;

    public function __construct(string $environment = 'test')
    {
        $this->environment = $environment;

        $this->gateway = PaymentGateway::where('code', 'worldline')->firstOrFail();
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
        $required = [
            'merchantCode', 'merchantSchemeCode', 'salt', 'typeOfPayment', 'currency',
        ];
        foreach ($required as $key) {
            if (!isset($this->configs[$key]) || $this->configs[$key] === '') {
                throw new \RuntimeException("Missing Worldline configuration: {$key}");
            }
        }
    }

    protected function config(string $key, $default = null)
    {
        return $this->configs[$key] ?? $default;
    }

    public function initializePayment(array $data): array
    {
        $merchantCode = $this->config('merchantCode');
        $amount = $data['amount'];

        if ($this->config('typeOfPayment') === 'TEST') {
            $amount = 1; // follow test mode convention
        }

        $phoneCc = (string)($data['phone_country_code'] ?? '');
        $phone = (string)($data['phone'] ?? '');
        $mobileNumber = str_replace('+', '', $phoneCc . $phone);
        $consumerId = 'c' . random_int(1, 1000000);

        // Default datastring: merchantId|txnId|amount||consumerId|mobile|email||||||||||salt
    $datastring = $merchantCode . '|' . $data['transaction_id'] . '|' . $amount . '|' . '|' . $consumerId . '|' . $mobileNumber . '|' . ($data['email'] ?? '') . '||||||||||' . $this->config('salt');
        $hashVal = hash('sha512', $datastring);

        $merArray = $this->configs; // expose for UI config

        if ($this->logEnabled) {
            Log::info('Worldline initializePayment', [
                'env' => $this->environment,
                'merchantCode' => $merchantCode,
                'txnId' => $data['transaction_id'] ?? null,
                'amount' => $amount,
            ]);
        }

        return [
            'success' => true,
            'gateway_configs' => $merArray,
            'data' => [
                'marchantId' => $merchantCode,
                'txnId' => $data['transaction_id'],
                'amount' => $amount,
                'currencycode' => $this->config('currency', 'INR'),
                'schemecode' => $this->config('merchantSchemeCode'),
                'consumerId' => $consumerId,
                'mobileNumber' => $mobileNumber,
                'email' => $data['email'] ?? '',
                'customerName' => $data['name'] ?? '',
                // Optional e-mandate fields left blank by default
                'accNo' => $data['accNo'] ?? '',
                'accountName' => $data['accountName'] ?? '',
                'aadharNumber' => $data['aadharNumber'] ?? '',
                'ifscCode' => $data['ifscCode'] ?? '',
                'accountType' => $data['accountType'] ?? '',
                'debitStartDate' => $data['debitStartDate'] ?? '',
                'debitEndDate' => $data['debitEndDate'] ?? '',
                'maxAmount' => $data['maxAmount'] ?? '',
                'amountType' => $data['amountType'] ?? '',
                'frequency' => $data['frequency'] ?? '',
                'cardNumber' => $data['cardNumber'] ?? '',
                'expMonth' => $data['expMonth'] ?? '',
                'expYear' => $data['expYear'] ?? '',
                'cvvCode' => $data['cvvCode'] ?? '',
                'hash' => $hashVal,
            ],
        ];
    }

    public function handleCallback(array $data): array
    {
        $msg = (string)($data['msg'] ?? '');
        $parts = explode('|', $msg);
        $statusCode = $parts[0] ?? '';
        $txnToken = $parts[5] ?? null;
        $amount = isset($parts[6]) ? (float) $parts[6] : null;
        $success = $statusCode === '0300';
        if ($this->logEnabled) {
            Log::info('Worldline handleCallback', [
                'env' => $this->environment,
                'statusCode' => $statusCode,
                'txnToken' => $txnToken,
                'amount' => $amount,
            ]);
        }
        return [
            'success' => $success,
            'status' => $success ? 'completed' : 'failed',
            'transaction_id' => $txnToken,
            'amount' => $amount,
            'gateway' => 'worldline',
            'raw' => $data,
        ];
    }

    public function verifyPayment(string $transactionId, ?string $transactionDate = null): array
    {
        try {
            $date = $transactionDate ?: now()->format('d-m-Y');
            $payload = [
                'merchant' => [
                    'identifier' => $this->config('merchantCode'),
                ],
                'transaction' => [
                    'deviceIdentifier' => 'S',
                    'currency' => $this->config('currency', 'INR'),
                    'identifier' => $transactionId,
                    'dateTime' => $date,
                    'requestType' => 'O',
                ],
            ];

            $json = json_encode($payload);
            $ch = curl_init('https://www.paynimo.com/api/paynimoV2.req');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $res = curl_exec($ch);
            if ($res === false) {
                $err = curl_error($ch);
                curl_close($ch);
                if ($this->logEnabled) {
                    Log::error('Worldline verifyPayment curl error', [
                        'env' => $this->environment,
                        'error' => $err,
                    ]);
                }
                return ['success' => false, 'message' => $err];
            }
            curl_close($ch);

            $data = json_decode($res, true);
            $txn = $data['paymentMethod']['paymentTransaction'] ?? [];
            $statusCode = $txn['statusCode'] ?? '';
            $success = $statusCode === '0300';
            if ($this->logEnabled) {
                Log::info('Worldline verifyPayment result', [
                    'env' => $this->environment,
                    'statusCode' => $statusCode,
                    'identifier' => $txn['identifier'] ?? null,
                ]);
            }
            return [
                'success' => $success,
                'status' => $success ? 'completed' : ($txn['statusMessage'] ?? 'failed'),
                'token_identifier' => $txn['identifier'] ?? null,
                'amount' => $txn['amount'] ?? null,
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            if ($this->logEnabled) {
                Log::error('Worldline verifyPayment exception', [
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
        return 'worldline';
    }
}
