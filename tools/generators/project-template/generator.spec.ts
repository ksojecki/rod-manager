import { readJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import projectTemplateGenerator from './generator';

describe('projectTemplateGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(
      'tsconfig.json',
      JSON.stringify(
        {
          extends: './tsconfig.base.json',
          references: [],
        },
        null,
        2,
      ),
    );
  });

  it('scaffolds template-based api and web apps without rod-manager dependencies', async () => {
    await projectTemplateGenerator(tree, { name: 'sample-portal' });

    expect(tree.exists('projects/sample-portal/apps/api/src/main.ts')).toBe(
      true,
    );
    expect(
      tree.exists('projects/sample-portal/apps/api/src/productConfig.ts'),
    ).toBe(true);
    expect(
      tree.exists('projects/sample-portal/apps/web/src/app/routes.tsx'),
    ).toBe(true);
    expect(
      tree.exists(
        'projects/sample-portal/apps/web/src/app/account/AccountPage.tsx',
      ),
    ).toBe(true);

    const apiPackageJson = readJson(
      tree,
      'projects/sample-portal/apps/api/package.json',
    ) as {
      dependencies: Record<string, string>;
      name: string;
    };
    const webPackageJson = readJson(
      tree,
      'projects/sample-portal/apps/web/package.json',
    ) as {
      dependencies: Record<string, string>;
      name: string;
    };

    expect(apiPackageJson.name).toBe('@sojecki/sample-portal-api');
    expect(apiPackageJson.dependencies).toEqual(
      expect.objectContaining({
        '@sojecki/platform-server-platform': '0.0.1',
      }),
    );
    expect(apiPackageJson.dependencies).not.toHaveProperty(
      '@sojecki/rod-manager-pages-server',
    );

    expect(webPackageJson.name).toBe('@sojecki/sample-portal-web');
    expect(webPackageJson.dependencies).toEqual(
      expect.objectContaining({
        '@sojecki/platform-web-platform': '0.0.1',
      }),
    );

    const productConfig = tree.read(
      'projects/sample-portal/apps/api/src/productConfig.ts',
      'utf-8',
    );
    expect(productConfig).toContain("projectId: 'sample-portal'");
    expect(productConfig).toContain('SAMPLE_PORTAL_AUTH_DB_PATH');
    expect(productConfig).toContain(
      'dist/projects/sample-portal/apps/web/client',
    );

    const routesSource = tree.read(
      'projects/sample-portal/apps/web/src/app/routes.tsx',
      'utf-8',
    );
    expect(routesSource).toContain('@sojecki/platform-web-platform');
    expect(routesSource).not.toContain('@sojecki/rod-manager');

    const rootTsConfig = readJson(tree, 'tsconfig.json') as {
      references: Array<{ path: string }>;
    };
    expect(rootTsConfig.references).toEqual(
      expect.arrayContaining([
        { path: './projects/sample-portal/apps/api' },
        { path: './projects/sample-portal/apps/web' },
      ]),
    );
  });
});
