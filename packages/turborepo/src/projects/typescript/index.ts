import path from "path";
import { RootSchema } from "@turbo/types/src/types/config";
import { DependencyType, filteredRunsOnOptions, YamlFile } from "projen";
import { BuildWorkflow } from "projen/lib/build";
import { AutoMerge } from "projen/lib/github";
import { DEFAULT_GITHUB_ACTIONS_USER } from "projen/lib/github/constants";
import {
  JobPermission,
  JobPermissions,
} from "projen/lib/github/workflows-model";
import { NodePackageManager, NodeProject } from "projen/lib/javascript";
import { CodeArtifactAuthProvider } from "projen/lib/release";
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from "projen/lib/typescript";
import { Changesets, ChangesetsConfig, Turborepo } from "../../components";

export interface TurborepoTsProjectOptions extends TypeScriptProjectOptions {
  turborepo: Omit<RootSchema, "$schema">;
  changeSetsConfig?: ChangesetsConfig;
}

export class TurborepoTsProject extends TypeScriptProject {
  public readonly turborepoBuildWorkflow?: BuildWorkflow;
  public readonly turborepoAutoMerge?: AutoMerge;

  constructor(options: TurborepoTsProjectOptions) {
    const defaultReleaseBranch = options.defaultReleaseBranch ?? "main";
    super({
      ...options,
      defaultReleaseBranch,
      packageManager: NodePackageManager.PNPM,
      sampleCode: false,
      jest: false,
      github: true,
      buildWorkflow: false,
      release: false,
      depsUpgrade: false,
    });

    this.defaultTask?.env("RELEASE", "true");
    this.npmrc.addConfig("auto-install-peers", "true");
    this.package.addField("private", true);
    this.package.addEngine("pnpm", ">=8");

    new Turborepo(this, options.turborepo);

    const buildEnabled = options.buildWorkflow ?? !this.parent;
    const requiresIdTokenPermission =
      (options.scopedPackagesOptions ?? []).length > 0 &&
      options.codeArtifactOptions?.authProvider ===
        CodeArtifactAuthProvider.GITHUB_OIDC;

    const workflowPermissions: JobPermissions = {
      idToken: requiresIdTokenPermission ? JobPermission.WRITE : undefined,
    };

    if (buildEnabled && this.github) {
      this.turborepoBuildWorkflow = new BuildWorkflow(this, {
        name: "turborepo-build",
        buildTask: this.buildTask,
        artifactsDirectory: this.artifactsDirectory,
        containerImage: options.workflowContainerImage,
        gitIdentity: options.workflowGitIdentity ?? DEFAULT_GITHUB_ACTIONS_USER,
        mutableBuild: options.mutableBuild,
        preBuildSteps: this.renderWorkflowSetup({
          mutable: options.mutableBuild ?? true,
        }),
        postBuildSteps: options.postBuildSteps,
        ...filteredRunsOnOptions(
          options.workflowRunsOn,
          options.workflowRunsOnGroup,
        ),
        workflowTriggers: options.buildWorkflowTriggers,
        permissions: workflowPermissions,
        env: {
          TURBO_TOKEN: "${{ secrets.TURBO_TOKEN }}",
          TURBO_TEAM: "${{ vars.TURBO_TEAM }}",
        },
      });
    }

    if (
      (options.autoMerge ?? true) &&
      this.github?.mergify &&
      this.turborepoBuildWorkflow?.buildJobIds
    ) {
      this.turborepoAutoMerge = new AutoMerge(
        this.github,
        options.autoMergeOptions,
      );
      this.turborepoAutoMerge.addConditionsLater({
        render: () =>
          this.turborepoBuildWorkflow?.buildJobIds.map(
            (id) => `status-success=${id}`,
          ) ?? [],
      });
    }

    const releaseEnabled =
      options.release ?? options.releaseWorkflow ?? !this.parent;
    if (releaseEnabled && this.github) {
      new Changesets(this, {
        autoMerge: options.autoMerge,
        repository: options.repository,
        baseBranch: options.defaultReleaseBranch,
        ...options.changeSetsConfig,
      });
    }
  }

  preSynthesize() {
    this.package.removeScript("projen");
    this.subprojects.forEach((subProject) => {
      if (
        subProject instanceof NodeProject &&
        subProject.deps.all.filter((dep) => dep.type === DependencyType.BUNDLED)
          .length
      ) {
        const pkgFolder = path.relative(this.root.outdir, subProject.outdir);
        subProject.packageTask.prependExec(
          `monorepo.pnpm-link-bundled-transitive-deps ${pkgFolder}`,
        );
      }
    });

    this.subprojects.forEach((subProject) => {
      if (subProject instanceof NodeProject) {
        subProject.tryRemoveFile(".npmrc");
        subProject.package.removeScript("projen");
        if (subProject.package.packageManager !== NodePackageManager.PNPM) {
          throw new Error(
            `${subProject.name} packageManager does not match the monorepo packageManager: ${this.package.packageManager}.`,
          );
        }
      }
    });

    super.preSynthesize();
  }

  private updateWorkspace() {
    const packages = this.subprojects.map((subproject) =>
      path.relative(this.outdir, subproject.outdir),
    );
    new YamlFile(this, "pnpm-workspace.yaml", {
      readonly: true,
      obj: {
        packages,
      },
    });
    this.package.addField("workspaces", {
      packages,
    });
  }

  synth() {
    this.updateWorkspace();
    super.synth();
  }
}
