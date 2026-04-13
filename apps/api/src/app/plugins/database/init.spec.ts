import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { ensurePageSlugValidationRules, initializeSchema } from './init';

const databases: Database.Database[] = [];

function createDatabase(): Database.Database {
  const db = new Database(':memory:');
  initializeSchema(db);
  ensurePageSlugValidationRules(db);
  databases.push(db);
  return db;
}

afterEach(() => {
  for (const db of databases.splice(0)) {
    db.close();
  }
});

describe('page slug validation rules', () => {
  it('rejects slug collision with reserved routes', () => {
    const db = createDatabase();

    expect(() => {
      db.prepare(`INSERT INTO pages (slug, content_md) VALUES (?, ?)`).run(
        'account',
        '# Reserved route',
      );
    }).toThrow('Page slug collides with a reserved application route.');
  });

  it('rejects empty slug values', () => {
    const db = createDatabase();

    expect(() => {
      db.prepare(`INSERT INTO pages (slug, content_md) VALUES (?, ?)`).run(
        '   ',
        '# Empty slug',
      );
    }).toThrow('Page slug cannot be empty.');
  });

  it('accepts non-reserved slugs', () => {
    const db = createDatabase();

    db.prepare(`INSERT INTO pages (slug, content_md) VALUES (?, ?)`).run(
      'community-news',
      '# Community News',
    );

    const row = db
      .prepare<
        [string],
        { slug: string; content_md: string }
      >(`SELECT slug, content_md FROM pages WHERE slug = ?`)
      .get('community-news');

    expect(row).toEqual({
      slug: 'community-news',
      content_md: '# Community News',
    });
  });
});
