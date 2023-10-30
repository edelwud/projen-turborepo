import { RootSchema } from '@turbo/types/src/types/config';
import { Component, JsonFile, Project } from 'projen';
import { NodeProject } from 'projen/lib/javascript';

export interface TurborepoOptions extends RootSchema {}

export class Turborepo extends Component {
  public static of(project: Project): Turborepo | undefined {
    const isTurborepo = (c: Component): c is Turborepo => c instanceof Turborepo;
    return project.components.find(isTurborepo);
  }

  private readonly nodeProject: NodeProject;

  constructor(project: NodeProject, options: TurborepoOptions) {
	  super(project);
    this.nodeProject = project;
    this.nodeProject.addDevDeps('turbo');
    this.nodeProject.gitignore.addPatterns('.turbo/');

    new JsonFile(this.nodeProject, 'turbo.json', {
      obj: options,
      readonly: true,
    });
  }
}