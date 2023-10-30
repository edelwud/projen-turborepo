import path from 'path';
import { DependencyType, YamlFile } from 'projen';
import { NodePackageManager, NodeProject } from 'projen/lib/javascript';
import { TypeScriptProject, TypeScriptProjectOptions } from 'projen/lib/typescript';
import { Turborepo } from '../../components';

export interface TurborepoTsProjectOptions extends TypeScriptProjectOptions {
}

export class TurborepoTsProject extends TypeScriptProject {
  constructor(options: TurborepoTsProjectOptions) {
	  const defaultReleaseBranch = options.defaultReleaseBranch ?? 'main';
    super({
	    ...options,
	    defaultReleaseBranch,
	    packageManager: NodePackageManager.PNPM,
	    sampleCode: false,
	    jest: false,
	    github: false,
    });

    this.npmrc.addConfig('auto-install-peers', 'true');
	  this.package.addField('private', true);
	  this.package.addEngine('pnpm', '>=8');

	  new Turborepo(this, {
      $schema: 'https://turbo.build/schema.json',
		  pipeline: {
			  build: {
				  dependsOn: ['^build'],
				  outputs: ['.next/**', '!.next/cache/**'],
			  },
			  test: {},
		  },
	  });
  }

  preSynthesize() {
    this.package.removeScript('projen');
	  this.subprojects.forEach((subProject) => {
		  if (
			  subProject instanceof NodeProject &&
			  subProject.deps.all.filter((dep) => dep.type === DependencyType.BUNDLED).length
		  ) {
			  const pkgFolder = path.relative(this.root.outdir, subProject.outdir);
			  subProject.packageTask.prependExec(
				  `monorepo.pnpm-link-bundled-transitive-deps ${pkgFolder}`,
			  );
		  }
	  });

	  this.subprojects.forEach((subProject) => {
		  if (subProject instanceof NodeProject) {
			  subProject.tryRemoveFile('.npmrc');
			  subProject.package.removeScript('projen');
		  }
	  });

    super.preSynthesize();
  };

  private updateWorkspace() {
    const packages = this.subprojects.map((subproject) => path.relative(this.outdir, subproject.outdir));
	  new YamlFile(this, 'pnpm-workspace.yaml', {
		  readonly: true,
		  obj: {
			  packages,
		  },
	  });
	  this.package.addField('workspaces', {
		  packages,
	  });
  }

  synth() {
    this.updateWorkspace();
    super.synth();
  }
}