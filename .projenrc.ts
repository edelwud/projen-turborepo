import { TurborepoTsProject } from "@yersh/projen-turborepo";
import { DependencyType } from "projen";
import { NodePackageManager, NpmAccess } from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";

const monorepo = new TurborepoTsProject({
  name: "projen-turborepo",
  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  defaultReleaseBranch: "main",

  autoMerge: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ["edelwud", "github-actions[bot]", "dependabot[bot]"],
  },
  pnpmVersion: "8",
  minNodeVersion: "20.9.0",
  workflowPackageCache: true,
  dependabot: true,

  projenrcTs: true,
  prettier: true,
  devDeps: ["@yersh/projen-turborepo@workspace:*"],

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

monorepo.addScripts({
  postinstall: "turbo run build --filter=@yersh/projen-turborepo",
});

const turborepo = new TypeScriptProject({
  parent: monorepo,
  name: "@yersh/projen-turborepo",
  outdir: "packages/turborepo",

  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  repositoryDirectory: "packages/turborepo",
  npmAccess: NpmAccess.PUBLIC,

  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  minNodeVersion: "20.9.0",

  prettier: true,
  deps: ["projen", "lodash", "@turbo/types", "@changesets/types"],
  devDeps: ["@types/lodash"],
});

const nextjs = new TypeScriptProject({
  parent: monorepo,
  name: "@yersh/projen-nextjs",
  outdir: "packages/nextjs",

  authorName: "Maksim Yersh",
  authorEmail: "yersh.maks@gmail.com",
  authorUrl: "yer.sh",
  repository: "https://github.com/edelwud/projen-turborepo",
  repositoryDirectory: "packages/nextjs",
  npmAccess: NpmAccess.PUBLIC,

  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  minNodeVersion: "20.9.0",

  prettier: true,
  deps: ["projen"],
});

[monorepo, turborepo, nextjs].forEach((project) => {
  project.deps.removeDependency("eslint");
  project.deps.addDependency("eslint@^7", DependencyType.DEVENV);
});

monorepo.synth();
