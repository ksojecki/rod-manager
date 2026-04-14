import type Database from 'better-sqlite3';
import type {
  ContentPage,
  ContentPageRow,
  ContentPageSummary,
  ContentPageSummaryRow,
  PageStore,
} from './types.js';

export function createPageStore(db: Database.Database): PageStore {
  const listPagesStatement = db.prepare<[], ContentPageSummaryRow>(
    `SELECT slug FROM pages ORDER BY slug ASC`,
  );

  const findPageBySlugStatement = db.prepare<[string], ContentPageRow>(
    `SELECT slug, content_md FROM pages WHERE slug = ?`,
  );

  return {
    listPages(): ContentPageSummary[] {
      return listPagesStatement.all().map((row) => ({
        slug: row.slug,
      }));
    },
    findPageBySlug(slug: string): ContentPage | undefined {
      const row = findPageBySlugStatement.get(slug);

      if (row === undefined) {
        return undefined;
      }

      return {
        slug: row.slug,
        contentMd: row.content_md,
      };
    },
  };
}
