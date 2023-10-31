import { Config } from "@changesets/types";
import { merge } from "lodash";
import { Component, JsonFile } from "projen";
import { GithubWorkflow } from "projen/lib/github";
import { JobPermission, JobStep } from "projen/lib/github/workflows-model";
import { NodeProject } from "projen/lib/javascript";

export interface ChangesetsConfig extends Partial<Config> {
  autoMerge?: boolean;
  repository?: string;
  defaultReleaseBranch?: string;
}

export class Changesets extends Component {
  constructor(project: NodeProject, config: ChangesetsConfig) {
    super(project);

    project.addDevDeps("@changesets/cli");
    project.addDevDeps("@changesets/changelog-github");
    const releaseTask = project.addTask("release", {
      steps: [{ spawn: "build" }, { exec: "changeset publish" }],
    });

    const { autoMerge, repository, defaultReleaseBranch, ...changeSetsConfig } =
      config;

    new JsonFile(project, ".changeset/config.json", {
      obj: merge(
        {
          $schema: "https://unpkg.com/@changesets/config@2.3.1/schema.json",
          changelog: [
            "@changesets/changelog-github",
            { repo: repository?.replace("https://github.com/", "") },
          ],
          baseBranch: defaultReleaseBranch,
          commit: false,
          access: "public",
          ignore: [],
          updateInternalDependencies: "patch",
        },
        changeSetsConfig,
      ),
    });

    const workflow = new GithubWorkflow(project.github!, "release");

    workflow.on({
      push: {
        branches: ["main"],
      },
    });

    const releaseJob = {
      runsOn: ["ubuntu-latest"],
      env: {
        CI: "true",
        TURBO_TOKEN: "${{ secrets.TURBO_TOKEN }}",
        TURBO_TEAM: "${{ vars.TURBO_TEAM }}",
      },
      permissions: {
        contents: JobPermission.WRITE,
        packages: JobPermission.WRITE,
        pullRequests: JobPermission.WRITE,
      },
      steps: [
        {
          name: "Checkout source code",
          uses: "actions/checkout@v4",
          with: {
            "fetch-depth": 0,
          },
        },
        {
          name: "Setup pnpm",
          uses: "pnpm/action-setup@v2.2.4",
          with: {
            version: "8",
          },
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v3",
          with: {
            "node-version": "20.9.0",
            cache: "pnpm",
            scope: "@edelwud",
            "registry-url": "https://npm.pkg.github.com",
          },
        },
        {
          name: "Install dependencies",
          run: "pnpm i --no-frozen-lockfile",
        },
        {
          name: project.buildTask.name,
          run: project.github?.project.runTaskCommand(project.buildTask),
        },
        {
          name: "Create Release Pull Request or Publish to npm",
          id: "changesets",
          uses: "changesets/action@v1",
          with: {
            title: "chore(changesets): :package: version packages",
            commit: "chore(changesets): version packages",
            publish: project.github?.project.runTaskCommand(releaseTask),
          },
          env: {
            GITHUB_TOKEN: project.github?.projenCredentials.tokenRef,
            NODE_AUTH_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
        },
      ] as JobStep[],
    };

    if (autoMerge) {
      releaseJob.steps = releaseJob.steps.concat({
        name: "Add auto-merge label for created Pull Request",
        if: "steps.changesets.outputs.pullRequestNumber != ''",
        uses: "actions-ecosystem/action-add-labels@v1",
        with: {
          number: "${{ steps.changesets.outputs.pullRequestNumber }}",
          labels: "auto-approve",
        },
      });
    }
    workflow.addJob("release", releaseJob);
  }
}
