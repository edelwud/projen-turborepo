import {
  NodeProject,
  TypeScriptCompilerOptions,
  TypescriptConfig,
  TypeScriptJsxMode,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { mergeTsconfigOptions } from "projen/lib/typescript";
import {
  NextJsTypeScriptProject,
  NextJsTypeScriptProjectOptions,
} from "projen/lib/web";
import { TailwindCSSComponent } from "../../components";

export interface NextJsTsProjectOptions
  extends Omit<NextJsTypeScriptProjectOptions, "tailwind"> {
  readonly nextui?: boolean;
}

export class NextJsTsProject extends NextJsTypeScriptProject {
  // @ts-ignore
  private readonly tailwindCss?: TailwindCSSComponent;
  constructor(options: NextJsTsProjectOptions) {
    super({
      srcdir: "src",
      minNodeVersion: "18.17.0",
      ...options,
      sampleCode: false,
      disableTsconfig: true,
      tailwind: false,
    });

    const compilerOptionDefaults: TypeScriptCompilerOptions = {
      target: "es5",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: TypeScriptModuleResolution.BUNDLER,
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: TypeScriptJsxMode.PRESERVE,
      // @ts-ignore
      incremental: true,
      plugins: [
        {
          name: "next",
        },
      ],
      paths: {
        "@/*": [`./${this.srcdir}/*`],
      },
    };

    if (!options.disableTsconfig) {
      // @ts-ignore
      this.tsconfig = new TypescriptConfig(
        this,
        mergeTsconfigOptions(
          {
            include: [
              "next-env.d.ts",
              "**/*.ts",
              "**/*.tsx",
              ".next/types/**/*.ts",
            ],
            exclude: ["node_modules"],
            compilerOptions: {
              ...compilerOptionDefaults,
            },
          },
          options.tsconfig,
        ),
      );
    }

    if (options.eslint && options.nextui) {
      this.addDevDeps("eslint-plugin-tailwindcss");
      this.eslint?.addExtends("plugin:tailwindcss/recommended");
    }

    if (options.eslint) {
      this.addDevDeps("eslint-config-next");
      this.eslint?.addExtends("next/core-web-vitals");
    }

    this.gitignore.exclude("next-env.d.ts");
    this.gitignore.exclude(".env*");

    if (options.nextui) {
      this.tailwindCss = new TailwindCSSComponent(this);
      this.addDeps("@nextui-org/react", "framer-motion");
      if (this.parent instanceof NodeProject) {
        this.parent?.npmrc.addConfig(
          "public-hoist-pattern[]",
          "*@nextui-org/*",
        );
      }
    }
  }
}
