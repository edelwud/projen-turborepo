import { RootSchema } from "@turbo/types/src/types/config";
import { Component, JsonFile, Project } from "projen";
import { BuildWorkflow } from "projen/lib/build";
import { NodeProject } from "projen/lib/javascript";
import { CommandUtils } from "../utils";

export interface TurborepoOptions extends RootSchema {}

export class Turborepo extends Component {
  public static of(project: Project): Turborepo | undefined {
    const isTurborepo = (c: Component): c is Turborepo =>
      c instanceof Turborepo;
    return project.components.find(isTurborepo);
  }

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

    new BuildWorkflow(this.nodeProject, {
      name: "turbo-build",
      buildTask: this.nodeProject.buildTask,
      artifactsDirectory: ".turbo",
      env: {
        TURBO_TOKEN: "${{ secrets.TURBO_TOKEN }}",
        TURBO_TEAM: "${{ vars.TURBO_TEAM }}",
      },
    });

    this.turboSchema = options;
  }

  synthesize() {
    new JsonFile(this.nodeProject, "turbo.json", {
      obj: Object.assign(this.turboSchema),
      readonly: true,
    });
    super.synthesize();
  }
}
