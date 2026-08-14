{{--
    The head a crawler reads.

    The storefront is an Inertia SPA with no SSR, so React never runs for a bot
    that doesn't execute JavaScript — everything below is resolved on the server
    from the current route and printed before the app boots. @see App\Support\Seo
--}}
@php
    $seoRoute = request()->route()?->getName();
    $seo = app(\App\Support\Seo::class);
    $meta = $seo->meta($seoRoute);
@endphp

{{-- The title lives in the Inertia head slot in the root template, so the SPA
     can retitle the tab on a client-side visit without leaving a second one. --}}
<meta name="description" content="{{ $meta['description'] }}">
<meta name="keywords" content="{{ $meta['keywords'] }}">
<meta name="robots" content="{{ $meta['robots'] }}">
<meta name="googlebot" content="{{ $meta['robots'] }}">
<meta name="author" content="{{ config('app.name') }}">
<link rel="canonical" href="{{ $meta['url'] }}">

{{-- Local SEO: the shop's coordinates, for the map and local-pack crawlers. --}}
<meta name="geo.region" content="LB-JL">
<meta name="geo.placename" content="{{ \App\Support\Seo::LOCALITY }}, Lebanon">
<meta name="geo.position" content="{{ \App\Support\Seo::LATITUDE }};{{ \App\Support\Seo::LONGITUDE }}">
<meta name="ICBM" content="{{ \App\Support\Seo::LATITUDE }}, {{ \App\Support\Seo::LONGITUDE }}">

{{-- Open Graph: what WhatsApp, Facebook and Instagram show when the link is shared. --}}
<meta property="og:type" content="{{ $meta['type'] }}">
<meta property="og:site_name" content="{{ config('app.name') }}">
<meta property="og:title" content="{{ $meta['title'] }}">
<meta property="og:description" content="{{ $meta['description'] }}">
<meta property="og:url" content="{{ $meta['url'] }}">
<meta property="og:image" content="{{ $meta['image'] }}">
<meta property="og:image:secure_url" content="{{ $meta['image'] }}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="{{ $meta['imageWidth'] }}">
<meta property="og:image:height" content="{{ $meta['imageHeight'] }}">
<meta property="og:image:alt" content="{{ $meta['imageAlt'] }}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="ar_LB">
<meta property="place:location:latitude" content="{{ \App\Support\Seo::LATITUDE }}">
<meta property="place:location:longitude" content="{{ \App\Support\Seo::LONGITUDE }}">
<meta property="business:contact_data:locality" content="{{ \App\Support\Seo::LOCALITY }}">
<meta property="business:contact_data:region" content="{{ \App\Support\Seo::REGION }}">
<meta property="business:contact_data:country_name" content="Lebanon">

{{-- Twitter / X --}}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $meta['title'] }}">
<meta name="twitter:description" content="{{ $meta['description'] }}">
<meta name="twitter:image" content="{{ $meta['image'] }}">
<meta name="twitter:image:alt" content="{{ $meta['imageAlt'] }}">

{{-- The schema.org graph: the restaurant, the site, this page, its breadcrumb,
     and the full menu as machine-readable dishes. --}}
<script type="application/ld+json">
{!! json_encode($seo->structuredData($seoRoute), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
</script>
