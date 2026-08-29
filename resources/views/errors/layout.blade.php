<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- An error page is never a destination worth indexing. --}}
    <meta name="robots" content="noindex, nofollow">

    <title>@yield('title') &middot; Pine</title>

    <link rel="icon" type="image/png" href="/favicon-96x96.png?v=20260802" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260802" />
    <link rel="shortcut icon" href="/favicon.ico?v=20260802" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260802" />
    <meta name="theme-color" content="#faf3de">

    @fonts

    @vite(['resources/css/app.css'])
</head>

<body class="font-sans antialiased">
    <div class="flex min-h-svh flex-col">
        <main class="flex flex-1 flex-col items-center justify-center gap-9 px-6 py-16">
            <a href="{{ route('home') }}" aria-label="Pine — back to the home page">
                @include('errors.partials.mark', ['class' => 'w-11 sm:w-12'])
            </a>

            <section class="w-full max-w-md rounded-[1.75rem] border border-primary/20 bg-primary/5 px-6 py-10 text-center sm:px-10">
                {{-- The status code carries the page; the words under it say
                     what it means. --}}
                <p class="text-7xl leading-none font-semibold text-primary sm:text-8xl">@yield('code')</p>

                <div class="mx-auto mt-7 h-px w-10 bg-primary/25"></div>

                <h1 class="mt-7 text-[11px] tracking-[0.16em] text-primary/60 uppercase">@yield('title')</h1>

                <p class="mx-auto mt-3 max-w-xs text-base leading-relaxed text-primary/80">@yield('message')</p>
            </section>

            <a href="{{ route('home') }}"
                class="inline-flex h-13 w-full max-w-xs items-center justify-center gap-3 rounded-full border border-primary bg-primary px-9 text-base font-medium text-primary-foreground transition-colors duration-300 ease-out hover:bg-transparent hover:text-primary sm:h-12 sm:w-auto">
                Back home
            </a>
        </main>

        @include('errors.partials.treeline')
    </div>
</body>

</html>
