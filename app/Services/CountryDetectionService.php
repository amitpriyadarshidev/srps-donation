<?php

namespace App\Services;

use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CountryDetectionService
{
    /**
     * Detect country from user's IP address
     */
    public function detectCountry(Request $request): ?Country
    {
        $ip = $this->getClientIp($request);

        // Skip detection for local/private IPs
        if ($this->isPrivateIp($ip)) {
            return $this->getDefaultCountry();
        }

        try {
            // Use ipapi.co service for country detection (2-letter code)
            $response = Http::timeout(3)
                ->withHeaders(['Accept' => 'text/plain'])
                ->get("https://ipapi.co/{$ip}/country/");

            if ($response->ok()) {
                $code = strtoupper(trim($response->body())) ?: null;
                if ($code && strlen($code) === 2) {
                    return Country::where('iso2', $code)->first();
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Country detection failed', ['message' => $e->getMessage()]);
        }

        return $this->getDefaultCountry();
    }

    /**
     * Get client IP address, preferring proxy headers safely
     */
    private function getClientIp(Request $request): string
    {
        $ipKeys = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR',
        ];

        foreach ($ipKeys as $key) {
            $serverVal = $request->server($key);
            if (!$serverVal) {
                continue;
            }
            $ip = $serverVal;
            if (strpos($ip, ',') !== false) {
                $ip = explode(',', $ip)[0];
            }
            $ip = trim($ip);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }

        return (string) $request->ip();
    }

    /**
     * Check if IP is private/local
     */
    private function isPrivateIp(string $ip): bool
    {
        return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }

    /**
     * Get default country (India)
     */
    private function getDefaultCountry(): ?Country
    {
        return Country::where('iso2', 'IN')->first();
    }
}
