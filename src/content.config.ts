import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期请使用 YYYY-MM-DD').refine(
  (value) => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
  '请填写有效的日期',
);
const schema = z.object({
  date,
  title: z.string().trim().min(1).optional(),
  updated: date.optional(),
  description: z.string().trim().min(1).optional(),
  draft: z.boolean().default(false),
}).refine((entry) => !entry.updated || entry.updated >= entry.date, {
  message: '更新日期不能早于发表日期', path: ['updated'],
});

// 不读取标题、日期或 frontmatter slug，网址只与相对文件名有关。
const generateId = ({ entry }: { entry: string }) => {
  const id = entry.replace(/\.(md|mdx)$/, '');
  if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(id)) {
    throw new Error(`记录文件名请使用小写字母、数字和短横线：${entry}`);
  }
  return id;
};

export const collections = {
  notes: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes', generateId }),
    schema,
  }),
  examples: defineCollection({
    // 正式构建完全不载入示例。演示构建另存 dist-demo，并设为 noindex。
    loader: import.meta.env.DEV || import.meta.env.MODE === 'demo'
      ? glob({ pattern: '**/*.{md,mdx}', base: './src/content/examples', generateId })
      : async () => [],
    schema,
  }),
};
