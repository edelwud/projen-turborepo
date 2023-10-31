import { Component, SampleFile, TextFile } from "projen";
import { NextJsTsProject } from "../projects";

export class TailwindCSSComponent extends Component {
  constructor(project: NextJsTsProject) {
    super(project);

    project.addDevDeps("tailwindcss", "postcss", "autoprefixer");

    new TextFile(project, "postcss.config.js", {
      lines: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}`.split("\n"),
    });

    new SampleFile(project, "tailwind.config.js", {
      contents: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    });

    project.npmignore?.exclude(`/postcss.config.json`);
    project.npmignore?.exclude(`/tailwind.config.js`);
  }

  synthesize() {
    super.synthesize();
  }
}
