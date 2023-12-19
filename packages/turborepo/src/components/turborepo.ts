import { RootSchema } from "@turbo/types/src/types/config";
import { merge } from "lodash";
import { Component, JsonFile, Project } from "projen";
import { NodeProject } from "projen/lib/javascript";
import { CommandUtils } from "../utils";

export interface TurborepoOptions extends RootSchema {}

export class Turborepo extends Component {
  public static of(project: Project): Turborepo | undefined {
    const isTurborepo = (c: Component): c is Turborepo =>
      c instanceof Turborepo;
    return project.components.find(isTurborepo);
  }

  private readonly defaultConfig: RootSchema = {
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: [".next/**", "!.next/cache/**", "dist/**", "lib/**"],
      },
      eslint: {},
      watch: {},
      test: {},
      package: {},
      compile: {},
    },
  };
  private readonly nodeProject: NodeProject;
  private readonly turboSchema: RootSchema;

  constructor(project: NodeProject, options: TurborepoOptions) {
    super(project);
    this.nodeProject = project;
    this.nodeProject.addDevDeps("turbo");
    this.nodeProject.gitignore.addPatterns(".turbo/");

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.buildTask,
      "npx turbo build",
      {
        receiveArgs: true,
      },
    );

    if (this.nodeProject.defaultTask)
      CommandUtils.prependDefaultCommand(
        this.nodeProject.buildTask,
        this.nodeProject.defaultTask,
      );

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.tasks.tryFind("watch"),
      "npx turbo watch",
      {
        receiveArgs: true,
      },
    );

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.testTask,
      "npx turbo test",
      {
        receiveArgs: true,
      },
    );

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.packageTask,
      "npx turbo package",
      {
        receiveArgs: true,
      },
    );

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.compileTask,
      "npx turbo compile",
      {
        receiveArgs: true,
      },
    );

    this.turboSchema = merge(this.defaultConfig, options);

    new JsonFile(this.nodeProject, "turbo.json", {
      obj: this.turboSchema,
      readonly: true,
    });
  }
}
