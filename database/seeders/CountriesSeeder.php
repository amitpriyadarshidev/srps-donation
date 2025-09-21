<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CountriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Fetching countries data from REST Countries API...');
        
        try {
            // Fetch countries data from REST Countries API
            $response = Http::timeout(30)->get('https://restcountries.com/v3.1/all');
            
            if ($response->successful()) {
                $countries = $response->json();
                $this->command->info('Successfully fetched ' . count($countries) . ' countries');
                
                foreach ($countries as $country) {
                    $this->seedCountry($country);
                }
            } else {
                $this->command->error('Failed to fetch from REST Countries API. Using fallback data...');
                $this->seedFallbackCountries();
            }
        } catch (\Exception $e) {
            $this->command->error('Error fetching countries: ' . $e->getMessage());
            $this->command->info('Using fallback countries data...');
            $this->seedFallbackCountries();
        }
    }

    private function seedCountry($countryData)
    {
        try {
            // Extract basic country information
            $name = $countryData['name']['common'] ?? '';
            $iso2 = $countryData['cca2'] ?? '';
            $iso3 = $countryData['cca3'] ?? '';
            $numericCode = $countryData['ccn3'] ?? null;
            
            // Extract phone code (IDD)
            $phoneCode = '';
            if (isset($countryData['idd']['root']) && isset($countryData['idd']['suffixes'])) {
                $root = $countryData['idd']['root'];
                $suffixes = $countryData['idd']['suffixes'];
                if (!empty($suffixes)) {
                    $phoneCode = $root . $suffixes[0]; // Take first suffix
                }
            }
            
            // Extract capital
            $capital = '';
            if (isset($countryData['capital']) && is_array($countryData['capital'])) {
                $capital = $countryData['capital'][0] ?? '';
            }
            
            // Extract currency
            $currencyCode = '';
            if (isset($countryData['currencies']) && is_array($countryData['currencies'])) {
                $currencyCode = array_keys($countryData['currencies'])[0] ?? '';
            }
            
            // Extract region and subregion
            $region = $countryData['region'] ?? '';
            $subregion = $countryData['subregion'] ?? '';
            
            // Extract flag emoji
            $flagIcon = $countryData['flag'] ?? '';
            
            // Extract languages
            $languages = isset($countryData['languages']) ? json_encode($countryData['languages']) : null;
            
            // Extract timezones
            $timezones = isset($countryData['timezones']) ? json_encode($countryData['timezones']) : null;
            
            // Extract coordinates
            $latitude = $countryData['latlng'][0] ?? null;
            $longitude = $countryData['latlng'][1] ?? null;
            
            // Find currency UUID
            $currencyId = null;
            if ($currencyCode) {
                $currency = DB::table('currencies')->where('code', $currencyCode)->first();
                $currencyId = $currency->id ?? null;
            }
            
            // Skip if country name or ISO codes are missing
            if (empty($name) || empty($iso2) || empty($iso3)) {
                return;
            }
            
            // Insert country
            DB::table('countries')->insert([
                'id' => Str::uuid(),
                'name' => $name,
                'iso2' => $iso2,
                'iso3' => $iso3,
                'numeric_code' => $numericCode,
                'phone_code' => $phoneCode,
                'capital' => $capital,
                'default_currency' => $currencyId,
                'currency_code' => $currencyCode,
                'region' => $region,
                'subregion' => $subregion,
                'flag_icon' => $flagIcon,
                'languages' => $languages,
                'timezones' => $timezones,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            $this->command->warn('Failed to seed country: ' . ($countryData['name']['common'] ?? 'Unknown') . ' - ' . $e->getMessage());
        }
    }

    private function seedFallbackCountries()
    {
        $fallbackCountries = [
            [
                'name' => 'United States',
                'iso2' => 'US',
                'iso3' => 'USA',
                'numeric_code' => '840',
                'phone_code' => '+1',
                'capital' => 'Washington D.C.',
                'currency_code' => 'USD',
                'region' => 'Americas',
                'subregion' => 'North America',
                'flag_icon' => '🇺🇸',
                'latitude' => 37.0902,
                'longitude' => -95.7129,
            ],
            [
                'name' => 'India',
                'iso2' => 'IN',
                'iso3' => 'IND',
                'numeric_code' => '356',
                'phone_code' => '+91',
                'capital' => 'New Delhi',
                'currency_code' => 'INR',
                'region' => 'Asia',
                'subregion' => 'Southern Asia',
                'flag_icon' => '🇮🇳',
                'latitude' => 20.5937,
                'longitude' => 78.9629,
            ],
            [
                'name' => 'United Kingdom',
                'iso2' => 'GB',
                'iso3' => 'GBR',
                'numeric_code' => '826',
                'phone_code' => '+44',
                'capital' => 'London',
                'currency_code' => 'GBP',
                'region' => 'Europe',
                'subregion' => 'Northern Europe',
                'flag_icon' => '🇬🇧',
                'latitude' => 55.3781,
                'longitude' => -3.4360,
            ],
            [
                'name' => 'Canada',
                'iso2' => 'CA',
                'iso3' => 'CAN',
                'numeric_code' => '124',
                'phone_code' => '+1',
                'capital' => 'Ottawa',
                'currency_code' => 'CAD',
                'region' => 'Americas',
                'subregion' => 'North America',
                'flag_icon' => '🇨🇦',
                'latitude' => 56.1304,
                'longitude' => -106.3468,
            ],
            [
                'name' => 'Australia',
                'iso2' => 'AU',
                'iso3' => 'AUS',
                'numeric_code' => '036',
                'phone_code' => '+61',
                'capital' => 'Canberra',
                'currency_code' => 'AUD',
                'region' => 'Oceania',
                'subregion' => 'Australia and New Zealand',
                'flag_icon' => '🇦🇺',
                'latitude' => -25.2744,
                'longitude' => 133.7751,
            ],
        ];

        foreach ($fallbackCountries as $countryData) {
            // Find currency UUID
            $currencyId = null;
            if ($countryData['currency_code']) {
                $currency = DB::table('currencies')->where('code', $countryData['currency_code'])->first();
                $currencyId = $currency->id ?? null;
            }

            DB::table('countries')->insert([
                'id' => Str::uuid(),
                'name' => $countryData['name'],
                'iso2' => $countryData['iso2'],
                'iso3' => $countryData['iso3'],
                'numeric_code' => $countryData['numeric_code'],
                'phone_code' => $countryData['phone_code'],
                'capital' => $countryData['capital'],
                'default_currency' => $currencyId,
                'currency_code' => $countryData['currency_code'],
                'region' => $countryData['region'],
                'subregion' => $countryData['subregion'],
                'flag_icon' => $countryData['flag_icon'],
                'languages' => null,
                'timezones' => null,
                'latitude' => $countryData['latitude'],
                'longitude' => $countryData['longitude'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
