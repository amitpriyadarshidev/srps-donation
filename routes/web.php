<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use Inertia\Inertia;

// Public routes
Route::get('/', [DonationController::class, 'index'])->name('home');

// Donation routes
Route::post('/donation/process', [DonationController::class, 'process'])->name('donation.process');
Route::get('/donation/{donation}/payment', [DonationController::class, 'paymentSelection'])->name('donation.payment-selection');
Route::get('/donation/{donation}/confirmation', [DonationController::class, 'confirmation'])->name('donation.confirmation');
Route::post('/donation/{donation}/pay', [DonationController::class, 'beginPayment'])->name('donation.pay');

// Protected routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Platform routes
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/plans', function () {
        return Inertia::render('dashboard');
    })->name('plans');

    Route::get('/users', function () {
        return Inertia::render('dashboard');
    })->name('users');

    Route::get('/member-tree', function () {
        return Inertia::render('dashboard');
    })->name('member-tree');

    // Finance routes
    Route::get('/deposits', function () {
        return Inertia::render('dashboard');
    })->name('deposits');

    Route::get('/withdrawals', function () {
        return Inertia::render('dashboard');
    })->name('withdrawals');

    // Reports routes
    Route::get('/transaction', function () {
        return Inertia::render('dashboard');
    })->name('transaction');

    Route::get('/commissions', function () {
        return Inertia::render('dashboard');
    })->name('commissions');

    Route::get('/referrals', function () {
        return Inertia::render('dashboard');
    })->name('referrals');

    // System routes
    Route::get('/settings/general', function () {
        return Inertia::render('dashboard');
    })->name('settings.general');

    Route::get('/settings/system', function () {
        return Inertia::render('dashboard');
    })->name('settings.system');

    Route::get('/settings/platform', function () {
        return Inertia::render('dashboard');
    })->name('settings.platform');

    Route::get('/settings/gdpr', function () {
        return Inertia::render('dashboard');
    })->name('settings.gdpr');

    // Frontend routes
    Route::get('/themes', function () {
        return Inertia::render('dashboard');
    })->name('themes');

    Route::get('/widgets', function () {
        return Inertia::render('dashboard');
    })->name('widgets');

    Route::get('/pages', function () {
        return Inertia::render('dashboard');
    })->name('pages');

    // Developer routes
    Route::get('/backup', function () {
        return Inertia::render('dashboard');
    })->name('backup');

    Route::get('/cache', function () {
        return Inertia::render('dashboard');
    })->name('cache');

    Route::get('/logs', function () {
        return Inertia::render('dashboard');
    })->name('logs');

    // Footer route
    Route::get('/support', function () {
        return Inertia::render('dashboard');
    })->name('support');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';