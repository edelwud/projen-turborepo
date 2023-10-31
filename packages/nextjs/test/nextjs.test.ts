import { synthSnapshot } from "projen/lib/util/synth";
import { NextJsTsProject } from "../src";

test("empty project", () => {
  const project = new NextJsTsProject({
    name: "empty",
    defaultReleaseBranch: "main",
  });
  expect(synthSnapshot(project)).toMatchSnapshot();
});
