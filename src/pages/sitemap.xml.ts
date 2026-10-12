import type { APIRoute } from 'astro';
import { getNotes, noteUrl, isPreview } from '../lib/notes';
export const GET: APIRoute = async ({ site }) => {
  if (!site || isPreview) return new Response(null, { status: 404 });
  const notes = await getNotes();
  const pages = [
    ...['/', '/archive/', '/about/'].map((path) => ({ path, updated: undefined as string | undefined })),
    ...notes.map((note) => ({ path: noteUrl(note), updated: note.data.updated || note.data.date })),
  ];
  const xml = pages.map(({ path, updated }) => `<url><loc>${new URL(path, site).href.replaceAll('&', '&amp;')}</loc>${updated ? `<lastmod>${updated}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
