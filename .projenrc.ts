import { NodePackageManager } from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";
import { TurborepoTsProject } from "projen-turborepo";

const project = new TurborepoTsProject({
  name: "projen-turborepo",
  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  defaultReleaseBranch: "main",

  autoMerge: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ["edelwud"],
  },
  release: false,
  depsUpgrade: false,
  pnpmVersion: "8",
  minNodeVersion: "20.9.0",
  workflowPackageCache: true,
  buildWorkflow: false,

  projenrcTs: true,
  prettier: true,
  devDeps: ["projen-turborepo@workspace:*"],

  turborepo: {
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: [".next/**", "!.next/cache/**", "dist/**"],
      },
      test: {},
    },
  },
});

new TypeScriptProject({
  parent: project,
  name: "sample-app",
  defaultReleaseBranch: "main",
  outdir: "apps/sample-app",
  packageManager: NodePackageManager.PNPM,
});

new TypeScriptProject({
  parent: project,
  name: "projen-turborepo",
  outdir: "packages/turborepo",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,

  prettier: true,
  deps: ["projen", "@turbo/types"],
});

project.synth();
