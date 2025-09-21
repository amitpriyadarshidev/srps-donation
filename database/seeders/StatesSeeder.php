<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Fetching states data from CountryStateCity API...');
        
        try {
            // Get all countries first
            $countries = DB::table('countries')->select('id', 'name', 'iso2')->get();
            
            foreach ($countries as $country) {
                $this->seedStatesForCountry($country);
            }
            
        } catch (\Exception $e) {
            $this->command->error('Error fetching states: ' . $e->getMessage());
            $this->command->info('Using fallback states data...');
            $this->seedFallbackStates();
        }
    }

    private function seedStatesForCountry($country)
    {
        try {
            // Try to fetch from a free API - using CountryStateCity API
            $response = Http::timeout(10)->get("https://api.countrystatecity.in/v1/countries/{$country->iso2}/states", [
                'X-CSCAPI-KEY' => env('CSC_API_KEY') // Optional API key
            ]);
            
            if ($response->successful()) {
                $states = $response->json();
                
                foreach ($states as $state) {
                    $this->insertState($country->id, $state);
                }
                
                $this->command->info("Seeded " . count($states) . " states for {$country->name}");
            } else {
                // Fallback for major countries
                $this->seedFallbackStatesForCountry($country);
            }
            
        } catch (\Exception $e) {
            $this->command->warn("Failed to fetch states for {$country->name}: " . $e->getMessage());
            $this->seedFallbackStatesForCountry($country);
        }
    }

    private function insertState($countryId, $stateData)
    {
        try {
            $name = $stateData['name'] ?? '';
            $code = $stateData['iso2'] ?? null;
            $latitude = $stateData['latitude'] ?? null;
            $longitude = $stateData['longitude'] ?? null;
            
            if (empty($name)) {
                return;
            }

            DB::table('states')->insert([
                'id' => Str::uuid(),
                'name' => $name,
                'code' => $code,
                'country_id' => $countryId,
                'type' => 'state',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            $this->command->warn("Failed to insert state: {$stateData['name']} - " . $e->getMessage());
        }
    }

    private function seedFallbackStatesForCountry($country)
    {
        $fallbackStates = $this->getFallbackStates();
        
        if (isset($fallbackStates[$country->iso2])) {
            $states = $fallbackStates[$country->iso2];
            
            foreach ($states as $state) {
                DB::table('states')->insert([
                    'id' => Str::uuid(),
                    'name' => $state['name'],
                    'code' => $state['code'] ?? null,
                    'country_id' => $country->id,
                    'type' => $state['type'] ?? 'state',
                    'latitude' => $state['latitude'] ?? null,
                    'longitude' => $state['longitude'] ?? null,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            $this->command->info("Seeded " . count($states) . " fallback states for {$country->name}");
        }
    }

    private function getFallbackStates()
    {
        return [
            'US' => [
                ['name' => 'Alabama', 'code' => 'AL', 'type' => 'state'],
                ['name' => 'Alaska', 'code' => 'AK', 'type' => 'state'],
                ['name' => 'Arizona', 'code' => 'AZ', 'type' => 'state'],
                ['name' => 'Arkansas', 'code' => 'AR', 'type' => 'state'],
                ['name' => 'California', 'code' => 'CA', 'type' => 'state'],
                ['name' => 'Colorado', 'code' => 'CO', 'type' => 'state'],
                ['name' => 'Connecticut', 'code' => 'CT', 'type' => 'state'],
                ['name' => 'Delaware', 'code' => 'DE', 'type' => 'state'],
                ['name' => 'Florida', 'code' => 'FL', 'type' => 'state'],
                ['name' => 'Georgia', 'code' => 'GA', 'type' => 'state'],
                ['name' => 'Hawaii', 'code' => 'HI', 'type' => 'state'],
                ['name' => 'Idaho', 'code' => 'ID', 'type' => 'state'],
                ['name' => 'Illinois', 'code' => 'IL', 'type' => 'state'],
                ['name' => 'Indiana', 'code' => 'IN', 'type' => 'state'],
                ['name' => 'Iowa', 'code' => 'IA', 'type' => 'state'],
                ['name' => 'Kansas', 'code' => 'KS', 'type' => 'state'],
                ['name' => 'Kentucky', 'code' => 'KY', 'type' => 'state'],
                ['name' => 'Louisiana', 'code' => 'LA', 'type' => 'state'],
                ['name' => 'Maine', 'code' => 'ME', 'type' => 'state'],
                ['name' => 'Maryland', 'code' => 'MD', 'type' => 'state'],
                ['name' => 'Massachusetts', 'code' => 'MA', 'type' => 'state'],
                ['name' => 'Michigan', 'code' => 'MI', 'type' => 'state'],
                ['name' => 'Minnesota', 'code' => 'MN', 'type' => 'state'],
                ['name' => 'Mississippi', 'code' => 'MS', 'type' => 'state'],
                ['name' => 'Missouri', 'code' => 'MO', 'type' => 'state'],
                ['name' => 'Montana', 'code' => 'MT', 'type' => 'state'],
                ['name' => 'Nebraska', 'code' => 'NE', 'type' => 'state'],
                ['name' => 'Nevada', 'code' => 'NV', 'type' => 'state'],
                ['name' => 'New Hampshire', 'code' => 'NH', 'type' => 'state'],
                ['name' => 'New Jersey', 'code' => 'NJ', 'type' => 'state'],
                ['name' => 'New Mexico', 'code' => 'NM', 'type' => 'state'],
                ['name' => 'New York', 'code' => 'NY', 'type' => 'state'],
                ['name' => 'North Carolina', 'code' => 'NC', 'type' => 'state'],
                ['name' => 'North Dakota', 'code' => 'ND', 'type' => 'state'],
                ['name' => 'Ohio', 'code' => 'OH', 'type' => 'state'],
                ['name' => 'Oklahoma', 'code' => 'OK', 'type' => 'state'],
                ['name' => 'Oregon', 'code' => 'OR', 'type' => 'state'],
                ['name' => 'Pennsylvania', 'code' => 'PA', 'type' => 'state'],
                ['name' => 'Rhode Island', 'code' => 'RI', 'type' => 'state'],
                ['name' => 'South Carolina', 'code' => 'SC', 'type' => 'state'],
                ['name' => 'South Dakota', 'code' => 'SD', 'type' => 'state'],
                ['name' => 'Tennessee', 'code' => 'TN', 'type' => 'state'],
                ['name' => 'Texas', 'code' => 'TX', 'type' => 'state'],
                ['name' => 'Utah', 'code' => 'UT', 'type' => 'state'],
                ['name' => 'Vermont', 'code' => 'VT', 'type' => 'state'],
                ['name' => 'Virginia', 'code' => 'VA', 'type' => 'state'],
                ['name' => 'Washington', 'code' => 'WA', 'type' => 'state'],
                ['name' => 'West Virginia', 'code' => 'WV', 'type' => 'state'],
                ['name' => 'Wisconsin', 'code' => 'WI', 'type' => 'state'],
                ['name' => 'Wyoming', 'code' => 'WY', 'type' => 'state'],
            ],
            'IN' => [
                ['name' => 'Andhra Pradesh', 'code' => 'AP', 'type' => 'state'],
                ['name' => 'Arunachal Pradesh', 'code' => 'AR', 'type' => 'state'],
                ['name' => 'Assam', 'code' => 'AS', 'type' => 'state'],
                ['name' => 'Bihar', 'code' => 'BR', 'type' => 'state'],
                ['name' => 'Chhattisgarh', 'code' => 'CT', 'type' => 'state'],
                ['name' => 'Goa', 'code' => 'GA', 'type' => 'state'],
                ['name' => 'Gujarat', 'code' => 'GJ', 'type' => 'state'],
                ['name' => 'Haryana', 'code' => 'HR', 'type' => 'state'],
                ['name' => 'Himachal Pradesh', 'code' => 'HP', 'type' => 'state'],
                ['name' => 'Jharkhand', 'code' => 'JH', 'type' => 'state'],
                ['name' => 'Karnataka', 'code' => 'KA', 'type' => 'state'],
                ['name' => 'Kerala', 'code' => 'KL', 'type' => 'state'],
                ['name' => 'Madhya Pradesh', 'code' => 'MP', 'type' => 'state'],
                ['name' => 'Maharashtra', 'code' => 'MH', 'type' => 'state'],
                ['name' => 'Manipur', 'code' => 'MN', 'type' => 'state'],
                ['name' => 'Meghalaya', 'code' => 'ML', 'type' => 'state'],
                ['name' => 'Mizoram', 'code' => 'MZ', 'type' => 'state'],
                ['name' => 'Nagaland', 'code' => 'NL', 'type' => 'state'],
                ['name' => 'Odisha', 'code' => 'OR', 'type' => 'state'],
                ['name' => 'Punjab', 'code' => 'PB', 'type' => 'state'],
                ['name' => 'Rajasthan', 'code' => 'RJ', 'type' => 'state'],
                ['name' => 'Sikkim', 'code' => 'SK', 'type' => 'state'],
                ['name' => 'Tamil Nadu', 'code' => 'TN', 'type' => 'state'],
                ['name' => 'Telangana', 'code' => 'TG', 'type' => 'state'],
                ['name' => 'Tripura', 'code' => 'TR', 'type' => 'state'],
                ['name' => 'Uttar Pradesh', 'code' => 'UP', 'type' => 'state'],
                ['name' => 'Uttarakhand', 'code' => 'UT', 'type' => 'state'],
                ['name' => 'West Bengal', 'code' => 'WB', 'type' => 'state'],
                ['name' => 'Andaman and Nicobar Islands', 'code' => 'AN', 'type' => 'union territory'],
                ['name' => 'Chandigarh', 'code' => 'CH', 'type' => 'union territory'],
                ['name' => 'Dadra and Nagar Haveli and Daman and Diu', 'code' => 'DN', 'type' => 'union territory'],
                ['name' => 'Delhi', 'code' => 'DL', 'type' => 'union territory'],
                ['name' => 'Jammu and Kashmir', 'code' => 'JK', 'type' => 'union territory'],
                ['name' => 'Ladakh', 'code' => 'LA', 'type' => 'union territory'],
                ['name' => 'Lakshadweep', 'code' => 'LD', 'type' => 'union territory'],
                ['name' => 'Puducherry', 'code' => 'PY', 'type' => 'union territory'],
            ],
            'CA' => [
                ['name' => 'Alberta', 'code' => 'AB', 'type' => 'province'],
                ['name' => 'British Columbia', 'code' => 'BC', 'type' => 'province'],
                ['name' => 'Manitoba', 'code' => 'MB', 'type' => 'province'],
                ['name' => 'New Brunswick', 'code' => 'NB', 'type' => 'province'],
                ['name' => 'Newfoundland and Labrador', 'code' => 'NL', 'type' => 'province'],
                ['name' => 'Northwest Territories', 'code' => 'NT', 'type' => 'territory'],
                ['name' => 'Nova Scotia', 'code' => 'NS', 'type' => 'province'],
                ['name' => 'Nunavut', 'code' => 'NU', 'type' => 'territory'],
                ['name' => 'Ontario', 'code' => 'ON', 'type' => 'province'],
                ['name' => 'Prince Edward Island', 'code' => 'PE', 'type' => 'province'],
                ['name' => 'Quebec', 'code' => 'QC', 'type' => 'province'],
                ['name' => 'Saskatchewan', 'code' => 'SK', 'type' => 'province'],
                ['name' => 'Yukon', 'code' => 'YT', 'type' => 'territory'],
            ],
            'AU' => [
                ['name' => 'Australian Capital Territory', 'code' => 'ACT', 'type' => 'territory'],
                ['name' => 'New South Wales', 'code' => 'NSW', 'type' => 'state'],
                ['name' => 'Northern Territory', 'code' => 'NT', 'type' => 'territory'],
                ['name' => 'Queensland', 'code' => 'QLD', 'type' => 'state'],
                ['name' => 'South Australia', 'code' => 'SA', 'type' => 'state'],
                ['name' => 'Tasmania', 'code' => 'TAS', 'type' => 'state'],
                ['name' => 'Victoria', 'code' => 'VIC', 'type' => 'state'],
                ['name' => 'Western Australia', 'code' => 'WA', 'type' => 'state'],
            ],
            'GB' => [
                ['name' => 'England', 'code' => 'ENG', 'type' => 'country'],
                ['name' => 'Scotland', 'code' => 'SCT', 'type' => 'country'],
                ['name' => 'Wales', 'code' => 'WLS', 'type' => 'country'],
                ['name' => 'Northern Ireland', 'code' => 'NIR', 'type' => 'country'],
            ]
        ];
    }

    private function seedFallbackStates()
    {
        $this->command->info('Seeding basic fallback states for major countries...');
        
        // This will be called if the main seeding completely fails
        $fallbackStates = $this->getFallbackStates();
        
        foreach ($fallbackStates as $countryCode => $states) {
            $country = DB::table('countries')->where('iso2', $countryCode)->first();
            
            if ($country) {
                foreach ($states as $state) {
                    DB::table('states')->insert([
                        'id' => Str::uuid(),
                        'name' => $state['name'],
                        'code' => $state['code'] ?? null,
                        'country_id' => $country->id,
                        'type' => $state['type'] ?? 'state',
                        'latitude' => $state['latitude'] ?? null,
                        'longitude' => $state['longitude'] ?? null,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                
                $this->command->info("Seeded " . count($states) . " states for {$countryCode}");
            }
        }
    }
}
