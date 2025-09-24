<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentGateway;
use App\Models\PaymentGatewayConfig;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Worldline
        $worldline = PaymentGateway::firstOrCreate(
            ['code' => 'worldline'],
            [
                'name' => 'WorldLine',
                'description' => 'Secure payment processing with multiple payment options including cards, net banking, UPI, and wallets.',
                'logo' => 'worldline-logo.png',
                'display_order' => 1,
                'is_active' => true,
                'is_default' => true,
            ]
        );

        $worldlineBase = [
            ['key' => 'merchantCode', 'type' => 'text', 'value' => 'T1100662', 'is_sensitive' => true],
            ['key' => 'merchantSchemeCode', 'type' => 'text', 'value' => 'FIRST', 'is_sensitive' => true],
            ['key' => 'salt', 'type' => 'text', 'value' => '6221663217KCONYJ', 'is_sensitive' => true],
            ['key' => 'typeOfPayment', 'type' => 'text', 'value' => 'TEST'],
            ['key' => 'currency', 'type' => 'text', 'value' => 'INR'],
            ['key' => 'primaryColor', 'type' => 'text', 'value' => 'red'],
            ['key' => 'secondaryColor', 'type' => 'text', 'value' => 'white'],
            ['key' => 'buttonColor1', 'type' => 'text', 'value' => 'red'],
            ['key' => 'buttonColor2', 'type' => 'text', 'value' => 'white'],
            ['key' => 'logoURL', 'type' => 'text', 'value' => 'https://www.paynimo.com/CompanyDocs/company-logo-md.png'],
            ['key' => 'enableExpressPay', 'type' => 'text', 'value' => '1'],
            ['key' => 'separateCardMode', 'type' => 'text', 'value' => '0'],
            ['key' => 'enableNewWindowFlow', 'type' => 'text', 'value' => '1'],
            ['key' => 'merchantMessage', 'type' => 'text', 'value' => ''],
            ['key' => 'disclaimerMessage', 'type' => 'text', 'value' => ''],
            ['key' => 'paymentMode', 'type' => 'text', 'value' => 'all'],
            ['key' => 'paymentModeOrder', 'type' => 'text', 'value' => 'wallets,cards,netBanking,imps,cashCards,UPI,MVISA,debitPin,NEFTRTGS,emiBanks'],
            ['key' => 'enableInstrumentDeRegistration', 'type' => 'text', 'value' => '0'],
            ['key' => 'transactionType', 'type' => 'text', 'value' => 'SALE'],
            ['key' => 'hideSavedInstruments', 'type' => 'text', 'value' => '0'],
            ['key' => 'saveInstrument', 'type' => 'text', 'value' => '0'],
            ['key' => 'displayTransactionMessageOnPopup', 'type' => 'text', 'value' => '0'],
            ['key' => 'embedPaymentGatewayOnPage', 'type' => 'text', 'value' => '0'],
            ['key' => 'enableEmandate', 'type' => 'text', 'value' => '0'],
            ['key' => 'hideSIConfirmation', 'type' => 'text', 'value' => '0'],
            ['key' => 'expandSIDetails', 'type' => 'text', 'value' => '0'],
            ['key' => 'enableDebitDay', 'type' => 'text', 'value' => '0'],
            ['key' => 'showSIResponseMsg', 'type' => 'text', 'value' => '0'],
            ['key' => 'showSIConfirmation', 'type' => 'text', 'value' => '0'],
            ['key' => 'enableTxnForNonSICards', 'type' => 'text', 'value' => '0'],
            ['key' => 'showAllModesWithSI', 'type' => 'text', 'value' => '0'],
            ['key' => 'enableSIDetailsAtMerchantEnd', 'type' => 'text', 'value' => '0'],
            ['key' => 'encryption_key', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'encryption_iv', 'type' => 'text', 'is_sensitive' => true],
        ];

        foreach ($worldlineBase as $config) {
            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $worldline->id,
                    'key' => $config['key'],
                    'environment' => 'test',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('WORLDLINE_TEST_' . strtoupper($config['key'])),
                    'is_active' => true,
                ]
            );

            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $worldline->id,
                    'key' => $config['key'],
                    'environment' => 'live',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('WORLDLINE_LIVE_' . strtoupper($config['key'])),
                    'is_active' => true,
                ]
            );
        }

        // EaseBuzz
        $easebuzz = PaymentGateway::firstOrCreate(
            ['code' => 'easebuzz'],
            [
                'name' => 'EaseBuzz',
                'logo' => 'easebuzz-logo.png',
                'description' => 'Simple and secure payment gateway with support for multiple payment methods.',
                'display_order' => 2,
                'is_active' => true,
                'is_default' => false,
            ]
        );

        $easebuzzBase = [
            ['key' => 'merchant_key', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'salt', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'sub_merchant_id', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'currency', 'type' => 'text', 'value' => 'INR'],
        ];

        foreach ($easebuzzBase as $config) {
            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $easebuzz->id,
                    'key' => $config['key'],
                    'environment' => 'test',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('EASEBUZZ_TEST_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );

            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $easebuzz->id,
                    'key' => $config['key'],
                    'environment' => 'live',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('EASEBUZZ_LIVE_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );
        }

        // Cashfree
        $cashfree = PaymentGateway::firstOrCreate(
            ['code' => 'cashfree'],
            [
                'name' => 'Cashfree',
                'logo' => 'cashfree-logo.png',
                'description' => 'Modern payment gateway with instant settlements and comprehensive payment methods.',
                'display_order' => 3,
                'is_active' => true,
                'is_default' => false,
            ]
        );

        $cashfreeBase = [
            ['key' => 'app_id', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'secret_key', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'currency', 'type' => 'text', 'value' => 'INR'],
        ];

        foreach ($cashfreeBase as $config) {
            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $cashfree->id,
                    'key' => $config['key'],
                    'environment' => 'test',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('CASHFREE_TEST_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );

            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $cashfree->id,
                    'key' => $config['key'],
                    'environment' => 'live',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('CASHFREE_LIVE_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );
        }

        // PayU
        $payu = PaymentGateway::firstOrCreate(
            ['code' => 'payu'],
            [
                'name' => 'PayU',
                'logo' => 'payu-logo.png',
                'description' => 'Trusted payment solution with advanced fraud protection and multiple payment options.',
                'display_order' => 4,
                'is_active' => true,
                'is_default' => false,
            ]
        );

        $payuBase = [
            ['key' => 'merchant_key', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'merchant_salt', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'auth_header', 'type' => 'text', 'is_sensitive' => true],
            ['key' => 'currency', 'type' => 'text', 'value' => 'INR'],
        ];

        foreach ($payuBase as $config) {
            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $payu->id,
                    'key' => $config['key'],
                    'environment' => 'test',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('PAYU_TEST_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );

            PaymentGatewayConfig::updateOrCreate(
                [
                    'payment_gateway_id' => $payu->id,
                    'key' => $config['key'],
                    'environment' => 'live',
                ],
                [
                    'type' => $config['type'],
                    'is_sensitive' => $config['is_sensitive'] ?? false,
                    'value' => $config['value'] ?? env('PAYU_LIVE_' . strtoupper($config['key']), ''),
                    'is_active' => true,
                ]
            );
        }
    }
}
