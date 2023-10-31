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
      watch: {},
      test: {},
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

    CommandUtils.overrideDefaultCommand(
      this.nodeProject.tasks.tryFind("watch"),
      "npx turbo watch",
      {
        receiveArgs: true,
      },
    );

    this.turboSchema = merge(this.defaultConfig, options);
  }

  synthesize() {
    new JsonFile(this.nodeProject, "turbo.json", {
      obj: Object.assign(this.turboSchema),
      readonly: true,
    });
    super.synthesize();
  }
}
