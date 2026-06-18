import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://ambassadeur-des-vtc.fr';

const PRIORITY: Record<string, string> = {
  city: '0.8',
  airport: '0.9',
  station: '0.7',
  transfer: '0.8',
};

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';

  let dynamicUrls: { loc: string; lastmod: string; priority: string }[] = [];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('seo_pages')
      .select('slug, page_type, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    dynamicUrls = (data ?? []).map((p: any) => ({
      loc: `${BASE_URL}/vtc/${p.slug}`,
      lastmod: (p.updated_at ?? '').split('T')[0],
      priority: PRIORITY[p.page_type] ?? '0.7',
    }));
  }

  const staticUrls = [
    { loc: `${BASE_URL}/`, lastmod: '', priority: '1.0' },
    { loc: `${BASE_URL}/vtc`, lastmod: '', priority: '0.9' },
  ];

  const allUrls = [...staticUrls, ...dynamicUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
