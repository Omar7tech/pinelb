{{--
    The page in plain HTML, for whoever reads it before running its JavaScript.

    Everything a customer sees is painted by React, so the raw document a
    crawler fetches is otherwise an empty div. This block puts the same
    headings, dishes and prices in that document — inside `<noscript>`, so it is
    never drawn on top of the real page — and gives the first indexing pass
    something to read. @see App\Support\Seo::menuOutline()
--}}
@php
    $crawlableRoute = request()->route()?->getName();
    $crawlableSeo = app(\App\Support\Seo::class);
    $crawlableMeta = $crawlableSeo->meta($crawlableRoute);
    $crawlableSettings = app(\App\Settings\GeneralSettings::class);
    // Only on the pages that actually show the menu — the outline stands in for
    // what React would have painted, so it must not claim more than the page does.
    $crawlableMenu = in_array($crawlableRoute, ['menu.dine-in', 'menu.delivery'], true)
        ? $crawlableSeo->menuOutline()
        : [];
@endphp

<noscript>
    <h1>{{ $crawlableMeta['title'] }}</h1>
    <p>{{ $crawlableMeta['description'] }}</p>

    <h2>Where we are</h2>
    <p>
        {{ \App\Support\Seo::LOCALITY }}, {{ \App\Support\Seo::REGION }}, Lebanon.
        @if ($phone = $crawlableSettings->usablePhoneNumber())
            Call <a href="tel:{{ $phone }}">{{ $phone }}</a>.
        @endif
        @if ($map = $crawlableSettings->usableMapUrl())
            <a href="{{ $map }}" rel="noreferrer">See us on the map</a>.
        @endif
    </p>

    <h2>Pages</h2>
    <ul>
        <li><a href="{{ route('home') }}">Home</a></li>
        <li><a href="{{ route('menu.dine-in') }}">Dine-in menu</a></li>
        @if ($crawlableSettings->online_ordering_active)
            <li><a href="{{ route('menu.delivery') }}">Delivery menu</a></li>
        @endif
        @if (app(\App\Settings\ReservationSettings::class)->is_active)
            <li><a href="{{ route('spots.index') }}">Reserve a spot</a></li>
        @endif
    </ul>

    @if ($crawlableMenu !== [])
        <h2>Menu</h2>
        @foreach ($crawlableMenu as $section)
            <h3>{{ $section['name'] }}</h3>
            <ul>
                @foreach ($section['items'] as $item)
                    <li>{{ $item['name'] }}@if ($item['price'] !== null) — ${{ $item['price'] }}@endif</li>
                @endforeach
            </ul>
        @endforeach
    @endif
</noscript>
