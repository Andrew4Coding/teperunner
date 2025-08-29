/*
 * This script generates a module and a page in the app directory.
 * It creates a new folder for the module, and generates an index.tsx file,
 * an action.ts file, and a loader.ts file inside that folder.
 * It also creates a new page in the routes folder with the specified name.
 *
 * Usage: pnpm generate:module <ModuleName> <pageName>
 * Example: pnpm generate:module Login index
 */

import fs from 'fs';
import path from 'path';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateModuleAndPage(moduleName, pageName) {
  const moduleFolder = path.join(
    'app',
    'modules',
    `${capitalize(moduleName)}Module`
  );
  const routesFolder = path.join('app', 'routes');
  const pageFile = `_page.${pageName}.tsx`;

  fs.mkdirSync(moduleFolder, { recursive: true });

  // index.tsx
  fs.writeFileSync(
    path.join(moduleFolder, 'index.tsx'),
    `import React from 'react'

export const ${capitalize(moduleName)}Module = () => {
  return (
    <main>${pageName}</main>
  )
}
`
  );

  // action.ts
  fs.writeFileSync(
    path.join(moduleFolder, 'action.ts'),
    `import type { ActionFunctionArgs } from "react-router";

export async function ${capitalize(moduleName)}Action({ request }: ActionFunctionArgs) {}
`
  );

  // loader.ts
  fs.writeFileSync(
    path.join(moduleFolder, 'loader.ts'),
    `import type { LoaderFunctionArgs } from "react-router";

export async function ${capitalize(moduleName)}Loader({ request }: LoaderFunctionArgs) {
  return null;
}
`
  );

  // Ensure routes folder exists
  fs.mkdirSync(routesFolder, { recursive: true });

  // _page.{pageName}.tsx
  fs.writeFileSync(
    path.join(routesFolder, pageFile),
    `import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { ${capitalize(moduleName)}Module } from '~/modules/${capitalize(moduleName)}Module';
import { ${capitalize(moduleName)}Action } from '~/modules/${capitalize(moduleName)}Module/action';
import { ${capitalize(moduleName)}Loader } from '~/modules/${capitalize(moduleName)}Module/loader';

export async function loader(args: LoaderFunctionArgs) {
  return ${capitalize(moduleName)}Loader(args);
}

export async function action(args: ActionFunctionArgs) {
  return ${capitalize(moduleName)}Action(args);
}

export default function ${capitalize(moduleName)}Page() {
  return <${capitalize(moduleName)}Module />;
}
`
  );

  console.log(
    `Module ${capitalize(moduleName)} and ${pageName} page generated successfully!`
  );
}

const [moduleName, pageName] = process.argv.slice(2);
if (!moduleName || !pageName) {
  console.error(
    'Usage: pnpm exec node scripts/generate-module-and-page.mjs <ModuleName> <pageName>'
  );
  process.exit(1);
}
generateModuleAndPage(moduleName, pageName);
