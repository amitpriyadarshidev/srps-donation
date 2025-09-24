<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use Inertia\Inertia;

// Public routes
Route::get('/', [DonationController::class, 'index'])->name('home');

// Pay routes (short, user-friendly prefix)
Route::post('/pay/process', [DonationController::class, 'process'])->name('donation.process');
Route::get('/pay/{donation}/edit', [DonationController::class, 'edit'])->name('donation.edit');
Route::put('/pay/{donation}', [DonationController::class, 'update'])->name('donation.update');
Route::get('/pay/{donation}', [DonationController::class, 'paymentSelection'])->name('donation.payment-selection');
Route::get('/pay/{donation}/confirmation', [DonationController::class, 'confirmation'])->name('donation.confirmation');
Route::post('/pay/{donation}/pay', [DonationController::class, 'beginPayment'])->name('donation.pay');
Route::post('/pay/{donation}/status', [DonationController::class, 'checkStatus'])->name('donation.status');
Route::match(['GET','POST'], '/pay/callback', [DonationController::class, 'paymentCallback'])->name('payment.callback');

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
    Route::get('/transactions', function () {
        return Inertia::render('dashboard');
    })->name('transactions');

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

    Route::get('/settings/form', function () { return Inertia::render('dashboard'); })->name('settings.form');
    Route::get('/settings/payment', function () { return Inertia::render('dashboard'); })->name('settings.payment');
    Route::get('/settings/email', function () { return Inertia::render('dashboard'); })->name('settings.email');

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

    Route::get('/logs', function () { return Inertia::render('dashboard'); })->name('logs');
    Route::get('/payments', function () { return Inertia::render('dashboard'); })->name('payments');
    Route::get('/refunds', function () { return Inertia::render('dashboard'); })->name('refunds');
    Route::get('/settlements', function () { return Inertia::render('dashboard'); })->name('settlements');
    // Master data
    Route::get('/currencies', function () { return Inertia::render('dashboard'); })->name('currencies');
    Route::get('/countries', function () { return Inertia::render('dashboard'); })->name('countries');
    Route::get('/states', function () { return Inertia::render('dashboard'); })->name('states');
    Route::get('/gateways', function () { return Inertia::render('dashboard'); })->name('gateways');
    // Admin
    Route::get('/roles', function () { return Inertia::render('dashboard'); })->name('roles');
    Route::get('/permissions', function () { return Inertia::render('dashboard'); })->name('permissions');

    // Footer route
    Route::get('/support', function () {
        return Inertia::render('dashboard');
    })->name('support');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';