<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;

/** Every status we ship a branded page for, with the words it puts on screen. */
dataset('error pages', [
    '401' => [401, 'Not signed in'],
    '403' => [403, 'No entry'],
    '404' => [404, 'Page not found'],
    '419' => [419, 'Page expired'],
    '429' => [429, 'Slow down'],
    '500' => [500, 'Something broke'],
    '503' => [503, 'Back shortly'],
]);

it('renders a branded page for each error status', function (int $status, string $title): void {
    $html = View::make("errors.{$status}")->render();

    expect($html)
        ->toContain((string) $status)
        ->toContain($title)
        // The shared layout: pine mark, treeline, and the way back home.
        ->toContain('aria-label="Pine"')
        ->toContain('error-treeline-front')
        ->toContain('Back home')
        ->toContain('noindex, nofollow');
})->with('error pages');

it('shows the not found page for an unknown url', function (): void {
    $this->get('/no-such-trail')
        ->assertNotFound()
        ->assertSee('Page not found');
});

it('shows the server error page when a route throws', function (): void {
    // With debug on, the exception is rendered as a stack trace instead.
    config(['app.debug' => false]);

    Route::get('/boom', fn () => throw new RuntimeException('boom'));

    $this->get('/boom')
        ->assertStatus(500)
        ->assertSee('Something broke');
});
