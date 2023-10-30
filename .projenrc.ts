import { NodePackageManager } from 'projen/lib/javascript';
import { TypeScriptProject } from 'projen/lib/typescript';
import { TurborepoTsProject } from 'projen-turborepo';

const project = new TurborepoTsProject({
  name: 'projen-turborepo',
  authorName: 'Maksim Yersh',
  authorEmail: 'yersh.maks@gmail.com',
  authorUrl: 'yer.sh',
  defaultReleaseBranch: 'main',

  projenrcTs: true,
  deps: ['projen-turborepo@workspace:*'],

  turborepo: {
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: ['.next/**', '!.next/cache/**'],
      },
      test: {},
    },
  },
});

new TypeScriptProject({
  parent: project,
  name: 'sample-app',
  defaultReleaseBranch: 'main',
  outdir: 'apps/sample-app',
  packageManager: NodePackageManager.PNPM,
});

new TypeScriptProject({
  parent: project,
  name: 'projen-turborepo',
  outdir: 'packages/turborepo',
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.PNPM,
  deps: ['projen', '@turbo/types'],
});

project.synth();