import type { APIRoute } from 'astro';
import { isPreview } from '../lib/notes';
export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *\n${isPreview ? 'Disallow: /' : 'Allow: /'}\n${site && !isPreview ? `Sitemap: ${new URL('/sitemap.xml', site)}\n` : ''}`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
