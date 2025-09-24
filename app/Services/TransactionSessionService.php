<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TransactionSessionService
{
	private string $sessionPrefix = 'txn_';
	private int $defaultExpiry = 1800; // 30 minutes

	public function store(string $transactionId, array $payload): bool
	{
		try {
			$sessionKey = $this->sessionPrefix . $transactionId;
			$data = [
				'id' => $transactionId,
				'd_id' => $payload['donation_id'] ?? null,
				'amt' => $payload['amount'] ?? null,
				'curr' => $payload['currency'] ?? null,
				'name' => $payload['donor_name'] ?? null,
				'email' => $payload['email'] ?? null,
				'phone' => $payload['phone'] ?? null,
				'status' => $payload['status'] ?? 'pending',
				'created' => now()->timestamp,
				'accessed' => now()->timestamp,
				's_id' => session()->getId(),
				'gateway' => $payload['gateway'] ?? null,
			];
			Cache::put($sessionKey, $data, $this->defaultExpiry);
			return true;
		} catch (\Exception $e) {
			Log::error('TxnSession store error', ['e' => $e->getMessage()]);
			return false;
		}
	}

	public function get(string $transactionId): ?array
	{
		try {
			$sessionKey = $this->sessionPrefix . $transactionId;
			$d = Cache::get($sessionKey);
			if (!$d) return null;
			$d['accessed'] = now()->timestamp;
			Cache::put($sessionKey, $d, $this->defaultExpiry);
			return [
				'transaction_id' => $d['id'],
				'donation_id' => $d['d_id'],
				'amount' => $d['amt'],
				'currency' => $d['curr'],
				'donor_name' => $d['name'],
				'email' => $d['email'],
				'phone' => $d['phone'],
				'status' => $d['status'],
				'created_at' => date('Y-m-d H:i:s', $d['created']),
				'last_accessed' => date('Y-m-d H:i:s', $d['accessed']),
				'gateway' => $d['gateway'] ?? null,
			];
		} catch (\Exception $e) {
			Log::error('TxnSession get error', ['e' => $e->getMessage()]);
			return null;
		}
	}

	public function updateStatus(string $transactionId, string $status): void
	{
		$sessionKey = $this->sessionPrefix . $transactionId;
		$d = Cache::get($sessionKey);
		if ($d) {
			$d['status'] = $status;
			$d['accessed'] = now()->timestamp;
			Cache::put($sessionKey, $d, $this->defaultExpiry);
		}
	}
}
