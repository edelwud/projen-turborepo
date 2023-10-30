import { NodePackageManager } from 'projen/lib/javascript';
import { TypeScriptProject } from 'projen/lib/typescript';
import { TurborepoTsProject } from './src';

const project = new TurborepoTsProject({
  name: 'projen-turborepo',
  authorName: 'Maksim Yersh',
  authorEmail: 'yersh.maks@gmail.com',
  authorUrl: 'yer.sh',

  autoMerge: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['edelwud'],
  },
  defaultReleaseBranch: 'main',
  release: true,
  minNodeVersion: '20.9.0',
  workflowNodeVersion: '20.9.0',
  workflowPackageCache: true,

  projenrcTs: true,

  deps: ['projen', '@turbo/types'],

  gitignore: ['test/__fixtures__'],
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
  name: 'sample-app2',
  defaultReleaseBranch: 'main',
  outdir: 'apps/sample-app2',
  packageManager: NodePackageManager.PNPM,
  deps: ['sample-app@workspace:*'],
});

project.synth();