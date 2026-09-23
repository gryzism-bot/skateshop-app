import { runEmployeeTypescriptExercises } from './employee-typescript';
import { runGeneralTypescriptExercises } from './general-typescript';
import { runPlaywrightSpecificExercises } from './playwright-specific';

async function main() {
  console.log('General TypeScript live coding exercises');
  await runGeneralTypescriptExercises();

  console.log('\nEmployee TypeScript live coding exercises');
  await runEmployeeTypescriptExercises();

  console.log('\nPlaywright-specific live coding exercises');
  await runPlaywrightSpecificExercises();

  console.log('\nAll live coding exercise groups passed.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
