import { TurborepoTsProject } from "@edelwud/projen-turborepo";
import { NodePackageManager, NpmAccess } from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";

const project = new TurborepoTsProject({
  name: "projen-turborepo",
  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  defaultReleaseBranch: "main",

  autoMerge: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ["edelwud", "github-actions[bot]"],
  },
  pnpmVersion: "8",
  minNodeVersion: "20.9.0",
  workflowPackageCache: true,

  projenrcTs: true,
  prettier: true,
  devDeps: ["@edelwud/projen-turborepo@workspace:*"],

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

const sampleApp = new TypeScriptProject({
  parent: project,
  name: "sample-app",
  defaultReleaseBranch: "main",
  outdir: "apps/sample-app",
  packageManager: NodePackageManager.PNPM,
});

sampleApp.package.addField("private", true);

new TypeScriptProject({
  parent: project,
  name: "@edelwud/projen-turborepo",
  outdir: "packages/turborepo",

  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  npmRegistryUrl: "https://npm.pkg.github.com",
  repositoryDirectory: "packages/turborepo",
  npmAccess: NpmAccess.PUBLIC,

  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  minNodeVersion: "20.9.0",

  prettier: true,
  deps: ["projen", "@turbo/types", "@changesets/types"],
});

new TypeScriptProject({
  parent: project,
  name: "@edelwud/projen-nextjs",
  outdir: "packages/nextjs",

  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  npmRegistryUrl: "https://npm.pkg.github.com",
  repositoryDirectory: "packages/nextjs",
  npmAccess: NpmAccess.PUBLIC,

  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  minNodeVersion: "20.9.0",

  prettier: true,
  deps: ["projen"],
});

project.synth();
