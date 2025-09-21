<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\State;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public API routes
Route::get('/states', function (Request $request) {
    $countryId = $request->get('country_id');
    
    if (!$countryId) {
        return response()->json([]);
    }
    
    $states = State::where('country_id', $countryId)
        ->active()
        ->orderBy('name')
        ->get(['id', 'name', 'code']);
    
    return response()->json($states);
})->name('api.states');