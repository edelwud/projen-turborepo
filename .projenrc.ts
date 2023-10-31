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
    allowedUsernames: ["edelwud"],
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

new TypeScriptProject({
  parent: project,
  name: "sample-app",
  defaultReleaseBranch: "main",
  outdir: "apps/sample-app",
  packageManager: NodePackageManager.PNPM,
});

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

  prettier: true,
  deps: ["projen", "@turbo/types", "@changesets/types"],
});

project.synth();
