<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Illuminate\Http\Response;

/**
 * The two files a crawler asks for before it reads a single page. Both are
 * served dynamically rather than sat in `public/`, so every URL they carry
 * points at whatever domain the site is actually running on, and the sitemap
 * only ever lists pages that exist right now.
 */
class SeoController extends Controller
{
    public function robots(Seo $seo): Response
    {
        return response(implode("\n", $seo->robotsLines()), 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    /**
     * The XML sitemap, with the image extension so the photo of each page is
     * offered to Google Images alongside the page itself.
     */
    public function sitemap(Seo $seo): Response
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
                .' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ];

        foreach ($seo->sitemapPages() as $page) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>'.e($page['loc']).'</loc>';

            if ($page['lastmod'] !== null) {
                $lines[] = '    <lastmod>'.e($page['lastmod']).'</lastmod>';
            }

            $lines[] = '    <changefreq>'.$page['changefreq'].'</changefreq>';
            $lines[] = '    <priority>'.$page['priority'].'</priority>';
            $lines[] = '    <image:image>';
            $lines[] = '      <image:loc>'.e($page['image']).'</image:loc>';
            $lines[] = '      <image:caption>'.e($page['caption']).'</image:caption>';
            $lines[] = '    </image:image>';
            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';

        return response(implode("\n", $lines)."\n", 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
