<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CurrenciesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'symbol_native' => '€', 'decimal_digits' => 2],
            ['code' => 'GBP', 'name' => 'British Pound Sterling', 'symbol' => '£', 'symbol_native' => '£', 'decimal_digits' => 2],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥', 'symbol_native' => '￥', 'decimal_digits' => 0],
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => 'CN¥', 'symbol_native' => 'CN¥', 'decimal_digits' => 2],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'symbol' => '₹', 'symbol_native' => '₹', 'decimal_digits' => 2],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'CA$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'AU$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'symbol' => 'CHF', 'symbol_native' => 'CHF', 'decimal_digits' => 2],
            ['code' => 'SEK', 'name' => 'Swedish Krona', 'symbol' => 'SEK', 'symbol_native' => 'kr', 'decimal_digits' => 2],
            ['code' => 'NOK', 'name' => 'Norwegian Krone', 'symbol' => 'NOK', 'symbol_native' => 'kr', 'decimal_digits' => 2],
            ['code' => 'DKK', 'name' => 'Danish Krone', 'symbol' => 'DKK', 'symbol_native' => 'kr', 'decimal_digits' => 2],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'HKD', 'name' => 'Hong Kong Dollar', 'symbol' => 'HK$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'KRW', 'name' => 'South Korean Won', 'symbol' => '₩', 'symbol_native' => '₩', 'decimal_digits' => 0],
            ['code' => 'TWD', 'name' => 'New Taiwan Dollar', 'symbol' => 'NT$', 'symbol_native' => 'NT$', 'decimal_digits' => 2],
            ['code' => 'MXN', 'name' => 'Mexican Peso', 'symbol' => 'MX$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'BRL', 'name' => 'Brazilian Real', 'symbol' => 'R$', 'symbol_native' => 'R$', 'decimal_digits' => 2],
            ['code' => 'ARS', 'name' => 'Argentine Peso', 'symbol' => 'AR$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'CLP', 'name' => 'Chilean Peso', 'symbol' => 'CL$', 'symbol_native' => '$', 'decimal_digits' => 0],
            ['code' => 'COP', 'name' => 'Colombian Peso', 'symbol' => 'CO$', 'symbol_native' => '$', 'decimal_digits' => 2],
            ['code' => 'PEN', 'name' => 'Peruvian Nuevo Sol', 'symbol' => 'S/.', 'symbol_native' => 'S/.', 'decimal_digits' => 2],
            ['code' => 'RUB', 'name' => 'Russian Ruble', 'symbol' => 'RUB', 'symbol_native' => '₽', 'decimal_digits' => 2],
            ['code' => 'PLN', 'name' => 'Polish Zloty', 'symbol' => 'PLN', 'symbol_native' => 'zł', 'decimal_digits' => 2],
            ['code' => 'CZK', 'name' => 'Czech Republic Koruna', 'symbol' => 'CZK', 'symbol_native' => 'Kč', 'decimal_digits' => 2],
            ['code' => 'HUF', 'name' => 'Hungarian Forint', 'symbol' => 'HUF', 'symbol_native' => 'Ft', 'decimal_digits' => 2],
            ['code' => 'TRY', 'name' => 'Turkish Lira', 'symbol' => 'TRY', 'symbol_native' => '₺', 'decimal_digits' => 2],
            ['code' => 'ZAR', 'name' => 'South African Rand', 'symbol' => 'ZAR', 'symbol_native' => 'R', 'decimal_digits' => 2],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => 'SAR', 'symbol_native' => '﷼', 'decimal_digits' => 2],
            ['code' => 'AED', 'name' => 'United Arab Emirates Dirham', 'symbol' => 'AED', 'symbol_native' => 'د.إ', 'decimal_digits' => 2],
            ['code' => 'KWD', 'name' => 'Kuwaiti Dinar', 'symbol' => 'KWD', 'symbol_native' => 'د.ك', 'decimal_digits' => 3],
            ['code' => 'QAR', 'name' => 'Qatari Rial', 'symbol' => 'QAR', 'symbol_native' => '﷼', 'decimal_digits' => 2],
            ['code' => 'BHD', 'name' => 'Bahraini Dinar', 'symbol' => 'BHD', 'symbol_native' => '.د.ب', 'decimal_digits' => 3],
            ['code' => 'OMR', 'name' => 'Omani Rial', 'symbol' => 'OMR', 'symbol_native' => '﷼', 'decimal_digits' => 3],
            ['code' => 'EGP', 'name' => 'Egyptian Pound', 'symbol' => 'EGP', 'symbol_native' => 'ج.م', 'decimal_digits' => 2],
            ['code' => 'ILS', 'name' => 'Israeli New Sheqel', 'symbol' => '₪', 'symbol_native' => '₪', 'decimal_digits' => 2],
            ['code' => 'THB', 'name' => 'Thai Baht', 'symbol' => '฿', 'symbol_native' => '฿', 'decimal_digits' => 2],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit', 'symbol' => 'RM', 'symbol_native' => 'RM', 'decimal_digits' => 2],
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'symbol' => 'Rp', 'symbol_native' => 'Rp', 'decimal_digits' => 2],
            ['code' => 'PHP', 'name' => 'Philippine Peso', 'symbol' => '₱', 'symbol_native' => '₱', 'decimal_digits' => 2],
            ['code' => 'VND', 'name' => 'Vietnamese Dong', 'symbol' => '₫', 'symbol_native' => '₫', 'decimal_digits' => 0],
            ['code' => 'PKR', 'name' => 'Pakistani Rupee', 'symbol' => 'PKR', 'symbol_native' => '₨', 'decimal_digits' => 2],
            ['code' => 'BDT', 'name' => 'Bangladeshi Taka', 'symbol' => 'BDT', 'symbol_native' => '৳', 'decimal_digits' => 2],
            ['code' => 'LKR', 'name' => 'Sri Lankan Rupee', 'symbol' => 'LKR', 'symbol_native' => '₨', 'decimal_digits' => 2],
            ['code' => 'NPR', 'name' => 'Nepalese Rupee', 'symbol' => 'NPR', 'symbol_native' => '₨', 'decimal_digits' => 2],
            ['code' => 'AFN', 'name' => 'Afghan Afghani', 'symbol' => 'AFN', 'symbol_native' => '؋', 'decimal_digits' => 2],
            ['code' => 'NZD', 'name' => 'New Zealand Dollar', 'symbol' => 'NZ$', 'symbol_native' => '$', 'decimal_digits' => 2],
        ];

        foreach ($currencies as $currency) {
            DB::table('currencies')->insert([
                'id' => Str::uuid(),
                'code' => $currency['code'],
                'name' => $currency['name'],
                'symbol' => $currency['symbol'],
                'symbol_native' => $currency['symbol_native'],
                'decimal_digits' => $currency['decimal_digits'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
