<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\SpotController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/menu/dine-in', [MenuController::class, 'dineIn'])->name('menu.dine-in');
Route::get('/menu/delivery', [MenuController::class, 'delivery'])->name('menu.delivery');

Route::get('/spots', [SpotController::class, 'index'])->name('spots.index');
