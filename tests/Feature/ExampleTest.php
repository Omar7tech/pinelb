<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

// The landing page shares the general settings, which live in the database.
uses(RefreshDatabase::class);

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});
