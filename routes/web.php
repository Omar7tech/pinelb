<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\SpotController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/menu/dine-in', [MenuController::class, 'dineIn'])->name('menu.dine-in');
Route::get('/menu/delivery', [MenuController::class, 'delivery'])->name('menu.delivery');

Route::get('/spots', [SpotController::class, 'index'])->name('spots.index');

// SEO: crawl rules and sitemap, served dynamically so their URLs follow the
// live domain and the sitemap only lists pages that are switched on.
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
