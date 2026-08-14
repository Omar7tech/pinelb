<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- The whole crawlable head: meta, Open Graph, and the schema.org graph.
         Resolved on the server because the SPA renders without SSR. --}}
    @include('partials.seo')

    <link rel="icon" type="image/png" href="/favicon-96x96.png?v=20260802" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260802" />
    <link rel="shortcut icon" href="/favicon.ico?v=20260802" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260802" />
    <meta name="apple-mobile-web-app-title" content="Pine" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#faf3de" />
    <link rel="manifest" href="/site.webmanifest?v=20260802" />

    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    <x-inertia::head>
        <title>{{ app(\App\Support\Seo::class)->meta(request()->route()?->getName())['title'] }}</title>
    </x-inertia::head>
</head>

<body class="font-sans antialiased">
    {{-- The same page in plain HTML, read only by whoever doesn't run the app. --}}
    @include('partials.crawlable')

    <x-inertia::app />
</body>

</html>
