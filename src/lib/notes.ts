import { getCollection, type CollectionEntry } from 'astro:content';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';

export type Note = CollectionEntry<'notes'> | CollectionEntry<'examples'>;
export const isPreview = import.meta.env.DEV || import.meta.env.MODE === 'demo';

export async function getNotes(): Promise<Note[]> {
  const published = import.meta.env.MODE === 'demo' ? [] : await getCollection('notes', ({ data }) => !data.draft);
  const examples = isPreview ? await getCollection('examples', ({ data }) => !data.draft) : [];
  return [...published, ...examples].sort((a, b) =>
    b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id),
  );
}

export function noteUrl(note: Note) {
  return `/${note.collection === 'examples' ? 'examples' : 'notes'}/${note.id}/`;
}

export function plainText(note: Note) {
  return toString(unified().use(remarkParse).parse(note.body ?? ''), { includeImageAlt: false })
    .replace(/\s+/g, ' ').trim();
}

export function excerpt(note: Note, length = 140) {
  if (note.data.description) return note.data.description;
  const text = Array.from(plainText(note));
  return text.length > length ? `${text.slice(0, length).join('')}…` : text.join('');
}

export function isLong(note: Note) {
  return Array.from(plainText(note)).length > 220;
}

export function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}
