import { typescript } from 'projen';

const project = new typescript.TypeScriptProject({
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

  deps: ['projen'],
});

project.synth();