import { synthSnapshot } from 'projen/lib/util/synth';
import { TurborepoTsProject } from '../src';

test('hello', () => {
  const monorepo = new TurborepoTsProject({
    name: 'empty',
    defaultReleaseBranch: 'main',
    turborepo: {
      pipeline: {
        build: {
          dependsOn: ['^build'],
          outputs: ['.next/**', '!.next/cache/**'],
        },
        test: {},
      },
    },
  });
  expect(synthSnapshot(monorepo)).toMatchSnapshot();
});